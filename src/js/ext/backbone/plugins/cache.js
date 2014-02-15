/* global Backbone: false */
define([ 'ext/backbone/plugin' ], function(Plugin) {
  'use strict';

  var useCache = false;
  var hasCache = false;
  var adapter;

  var CacheEvents = {
    Model: {
      updateOn: 'sync',
      purgeOn:  'clear destroy'
    },

    Collection: {
      updateOn: 'add sync remove',
      purgeOn:  'reset'
    }
  };

  /**
   * @ignore
   */
  var shouldUseCache = function(options) {
    options = options || {};

    if (options.noCache) {
      return false;
    }

    return options.useCache === void 0 ?
      hasCache && useCache :
      hasCache && options.useCache;
  };

  /**
   * @ignore
   */
  var parseEvents = function(that) {
    var
    defaultEvents = _.clone(that._cacheEvents),
    updateOn      = that.cache.updateOn || that.cache.events,
    purgeOn       = that.cache.purgeOn;

    if (that.cache.updateOn === void 0) {
      updateOn = defaultEvents.updateOn;
    }

    if (that.cache.purgeOn === void 0) {
      purgeOn = defaultEvents.purgeOn;
    }

    return { updateOn: updateOn, purgeOn: purgeOn };
  };

  /**
   * @class Backbone.Cacheable
   *
   * Modules that can be transparently persisted into a storage layer.
   *
   * **This interface should not be used directly, use Backbone.CachePlugin instead.**
   */
  var Cacheable = {
    addCacheListeners: function() {
      if (!this.cache.manual) {
        // var events = parseEvents(this);
        var events = this._cacheEvents;

        if (events.updateOn) {
          this.on(events.updateOn, this.updateCacheEntry, this);
        }

        if (events.purgeOn) {
          this.on(events.purgeOn, this.purgeCacheEntry, this);
        }

        return true;
      }
    },

    removeCacheListeners: function() {
      if (!this.cache.manual) {
        // var events = parseEvents(this);
        var events = this._cacheEvents;

        if (events.updateOn) {
          this.off(events.updateOn, this.updateCacheEntry, this);
        }

        if (events.purgeOn) {
          this.off(events.purgeOn, this.purgeCacheEntry, this);
        }

        return true;
      }
    },

    /**
     * A cache-enabled drop-in for Backbone#fetch.
     *
     * Looks up the cache for an entry for this resource and calls back
     * the appropriate handlers detailed below.
     *
     * **This is not an async OP.**
     *
     * > You can reference `options.cached` in your handlers to tell whether
     * > the response was pulled out of the cache or from the remote endpoint.
     *
     * @param {Object} [options={}]
     * Regulard Backbone request options construct, with special callbacks.
     *
     * @param {Function} [options.success]
     * A function to be called when a cached version was found.
     * @param {Object} options.success.data
     * The cached response.
     * @param {Object} options.success.options
     * The request options.
     *
     * @param {Function} [options.error]
     * A function to be called when no cached version is available.
     * @param {Mixed} options.error.resource
     * The resource being cached.
     * @param {Object} options.error.options
     * The request options.
     *
     * @param {Function} [options.complete]
     * A function to be called when fetch completes, with either status.
     * @param {Mixed} options.complete.resource
     * The resource being cached.
     * @param {Object} options.complete.options
     * The request options.
     */
    fetchCached: function(options) {
      options = options || {};
      options.cached = true;
      options.transport = 'localStorage';
      options.data = this.getCacheEntry();

      return Backbone.sync.call(this, 'read', this, options);
    },

    /**
     * Retrieve the cached version (if any) of this resource.
     *
     * @return {Object/null}
     * The cached JSON entry for this resource, or `null` when the adapter isn't
     * available.
     */
    getCacheEntry: function() {
      var key;

      if (!hasCache) {
        return null;
      }

      key = _.result(this.cache, 'key', this);

      return adapter.get(key);
    },

    /**
     * Create or update the cache entry.
     *
     * The entry can be 'namespaced' based on the cache.usePrefix variable.
     * If set to `true`, the `cache.key` will be used as a namespace, and if
     * set to a String or a Function, the value will be used as a namespace.
     *
     * @note
     * This is a no-op if caching for this resource has been disabled,
     * the adapter isn't available, or the resource cache key does not evaluate
     * to true.
     */
    updateCacheEntry: function(resource, response, options) {
      var prefix;
      var data = {};
      var key = _.result(this.cache, 'key', this);

      if (this.cacheDisabled || !hasCache || !key) {
        return this;
      }
      else if (options && options.cached) {
        return this;
      }

      // Resolve the entry prefix
      if (this.cache.usePrefix) {
        if (_.isBoolean(this.cache.usePrefix)) {
          prefix = _.result(this.cache, 'key', this);
        }
        else {
          prefix = _.result(this.cache, 'usePrefix', this);
        }

        data[prefix] = this.toJSON();
      }
      else {
        data = this.toJSON();
      }

      //>>excludeStart("production", pragmas.production);
      console.debug('Caching entry [', key, ']');
      //>>excludeEnd("production");

      adapter.set(key, data);

      return this;
    },

    /**
     * Remove the cache entry (if any).
     *
     * @note
     * This is a no-op if caching for this resource has been disabled,
     * the adapter isn't available, or the resource cache key does not evaluate
     * to true.
     */
    purgeCacheEntry: function() {
      var key = _.result(this.cache, 'key', this);

      if (this.cacheDisabled || !shouldUseCache({}) || !key) {
        return this;
      }

      adapter.remove(key);

      return this;
    },

    /**
     * Freezes the cache entry. Updates and purges will no longer go through.
     *
     * This is particularly helpful for collections when you know you'll be
     * modifying the resource heavily while resetting or fetching, so you can
     * choose to disable caching prior to fetching, and re-enable it once all
     * the models have been added.
     *
     * This is a no-op if caching was already disabled for this resource.
     *
     * See #enableCaching
     */
    disableCaching: function() {
      if (!this.cacheDisabled) {
        this.cacheDisabled = true;
        console.warn(this.toString() + ': caching disabled.');
      }

      return this;
    },

    /**
     * Updates and purges of the cache entry will once again be processed.
     *
     * This is a no-op if caching was not disabled for this resource.
     *
     * See #disableCaching
     */
    enableCaching: function() {
      if (this.cacheDisabled) {
        delete this.cacheDisabled;
      }

      return this;
    }
  };

  /**
   * @class Backbone.CacheableModel
   * @extends Backbone.Model
   * @mixins Backbone.Cacheable
   */
  var CacheableModel = {
    /**
     * Sync the model with the server version, and update the cache entry
     * unless #manual or options.cached are enabled.
     */
    sync: function(op, resource, options) {
      options = options || {};

      if (op === 'read') {
        var success = options.success;
        var useCache = shouldUseCache(options);
        var that = this;

        options.success = function(data, options) {
          var out = success && success(data, options);

          if (!options.cached && !that.cache.manual) {
            that.updateCacheEntry();
          }

          return out;
        };

        if ( useCache ) {
          return this.fetchCached(options);
        }
      }

      return this._noCache.sync.apply(this, arguments);
    },

    /**
     * Update the model's cache entry unless options.silent is on, or
     * this.cache.manual is on.
     *
     * Delegates to Backbone.Model#set.
     */
    set: function(key, value, options) {
      var out = this._noCache.set.apply(this, arguments);

      if (!key) {
        return out;
      }

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (_.isObject(key)) {
        options = value;
      }

      options = options || {};

      if (!this._changing && !options.silent && !this.cache.manual) {
        this.updateCacheEntry();
      }

      return out;
    },

    clear: function() {
      if (!this.cache.manual) {
        this.purgeCacheEntry();
      }

      return this._noCache.clear.apply(this, arguments);
    }
  };

  /**
   * @class Backbone.CacheableCollection
   * @extends Backbone.Model
   * @mixins Backbone.Cacheable
   */
  var CacheableCollection = {
    /**
     * Updates the cache entry on successful non-cache requests.
     *
     * On 'use cache' requests, this method intercepts #fetch and returns a cached
     * version, otherwise the original #fetch is delegated.
     *
     * Caching is disabled during the fetch operation.
     *
     * See Cacheable#shouldUseCache
     */
    sync: function(op, resource, options) {
      options = options || {};

      if (op == 'read') {
        var that = this;
        var success = options.success;
        var complete = options.complete;
        var useCache = shouldUseCache(options);

        options.success = function() {
          var out;

          if (success) {
            out = success.apply(success, arguments);
          }

          // Cache the response if the collection supports caching and the response
          // wasn't pulled from the cache.
          if (!options.cached) {
            that.updateCacheEntry();
          }

          return out;
        };

        options.complete = function() {
          that.addCacheListeners();

          if (complete) {
            return complete.apply(complete, arguments);
          }
        };

        this.removeCacheListeners();

        // Should we get a cached version?
        if ( useCache ) {
          return this.fetchCached(options);
        }
      }

      return this._noCache.sync.apply(this, arguments);
    }
  };

  var Cacheables = {
    Model: CacheableModel,
    Collection: CacheableCollection
  };

  /**
   * @class Backbone.Plugin.Cache
   * @extends Backbone.Plugin
   *
   * A caching layer for Backbone models and collections.
   */
  return Plugin.extend({
    name: 'Cache',
    version: '0.1.0',
    bbVersion: '1.0.0',
    dependencies: [ 'Sentinel' ],
    sisters: [ 'DeepModels' ],
    options: {
      events: {}
    },

    setup: function(options) {
      options = options || {};

      var ensureKlassName = function(klass, klassName) {
        if (Backbone[klass] && !Backbone[klass].prototype.klass) {
          Backbone[klass].prototype.klass = klassName || klass;
        }
      };

      var trackOverriddenMethods = function(klassName, cacheableName) {
        var klass = Backbone[klassName].prototype;
        var cacheable = Cacheables[cacheableName || klassName];

        klass._noCache = {};

        for (var methodId in cacheable) {
          klass._noCache[methodId] = klass[methodId];
        }
      };

      _.merge(CacheEvents, this.options.events, options.events);

      Backbone.journalled = function() {
        return hasCache && useCache;
      };

      ensureKlassName('Model');
      ensureKlassName('Collection');

      trackOverriddenMethods('Model');
      trackOverriddenMethods('Collection');

      // Look for the Backbone.DeepModel plugin - if it's installed, we must
      // wrap it before anyone else extends it!
      //
      // This is why we can't wait to do this at the plugin sisterhood setup stage.
      if (Backbone.DeepModel) {
        ensureKlassName('DeepModel', 'Model');
        trackOverriddenMethods('DeepModel', 'Model');
      }

      // Enable caching functionality to entities that require it:
      this.listenTo(Backbone, 'model:creating collection:creating', this.makeCacheable);
    },

    makeCacheable: function(entity) {
      // Cache-enabled objects must have a 'cache' object defined.
      if (!entity.cache || !_.isObject(entity.cache)) {
        return;
      }

      var klass = entity.klass;
      var klassEvents = CacheEvents[klass];
      var klassCacheableInterface = Cacheables[klass];

      // The next part deals with resolving conflicts between method overrides:
      //
      // If the entity has defined any of the methods we'll be overriding,
      // we must track the instance methods instead of the prototype ones
      // in the _noCache key, otherwise the instance methods will never be
      // called.
      //
      // It's good to keep in mind that there may be 3 versions of each method:
      //
      // - the prototype base version
      // - the instance override/implementation version
      // - the Cacheable version
      //
      // Chain goes like Cacheable -> Instance -> Prototype
      var instanceMethods = [];
      for (var cacheableMethod in klassCacheableInterface) {
        if (entity[cacheableMethod]) {
          instanceMethods.push( cacheableMethod );
        }
      }

      if (instanceMethods.length) {
        // Start with the prototype methods, and override as needed
        //
        // Important: must use _.clone, otherwise we'll be overriding the methods
        // for _all_ instances of this class
        entity._noCache = _.clone(Backbone[klass].prototype._noCache);

        _.each(instanceMethods, function(idMethod) {
          // Use instance version
          entity._noCache[idMethod] = entity[idMethod];
        });
      }

      // Mixin the Cacheable interface(s)
      _.extend(entity, Cacheable, klassCacheableInterface, {
        _cacheEvents: _.clone(klassEvents)
      });

      entity._cacheEvents = parseEvents(entity);
      entity.addCacheListeners();

      // Preload cached data, if requested.
      if (entity.cache.preload) {
        var preload = function() {
          if (!hasCache) {
            console.error('can not preload', entity.id, 'as cache is not available.');
            return;
          }

          entity.set(entity.getCacheEntry());
        };

        hasCache ? preload() : _.defer(preload) /* try later */;
      }

      // console.log('added cache listeners:', entity._cacheEvents);
      // this.log('entity#', entity.id || entity.name, 'is now cacheable.');
    },

    cleanup: function() {
      _.each([ 'Model', 'Collection', 'DeepModel' ], function(klassName) {
        if (Backbone[klassName]) {
          delete Backbone[klassName].prototype._noCache;
          delete Backbone[klassName].prototype.klass;
        }
      });
    },

    /**
     * Install a storage adapter to use as a caching persistence layer.
     *
     * The adapter must provide an implementation of the methods outlined below:
     *
     * **Note**:
     *
     * I don't think it's possible to test whether the adapter actually
     * conforms to the argument types without an external tool, so my best bet
     * is to say that the behaviour is undefined if the adapter *does* implement
     * the methods but does not accept the expected arguments.
     *
     * @param {Object} in_adapter
     *
     * A storage adapter which must provide an implementation of the methods
     * outlined below.
     *
     * @param {Function} in_adapter.set       A method for storing records.
     * @param {String} in_adapter.set.key     The key to use for storing the record.
     * @param {Mixed} in_adapter.set.value    The value to store.
     *
     * @param {Function} in_adapter.get       A method for retrieving records.
     * @param {String} in_adapter.get.key     The record key.
     *
     * @param {Function} in_adapter.remove    A method for removing records.
     * @param {String} in_adapter.remove.key  Key of the record to remove.
     *
     * @param {Function} in_adapter.clear     Clear all stored records.
     *
     * @fires adapter_installed
     */
    setAdapter: function(in_adapter) {
      // Make sure the adapter adopts an interface we can use.
      _.each([ 'set', 'get', 'remove', 'clear' ], function(required_method) {
        var method = in_adapter[required_method];

        if (!_.isFunction(method)) {
          throw new TypeError([
            this.name, 'bad adapter: missing method implemention #',
            required_method
          ].join(' '));
        }
      });

      adapter = in_adapter;

      /**
       * @event adapter_installed
       *
       * A caching adapter has been installed for use to cache Backbone entities.
       *
       * **This event is triggered on Backbone.Cache.**
       *
       * @param {Backbone.Cache} Cache
       * Backbone.Cache plugin instance (`this`).
       *
       * @param {Object} adapter
       * The cache adapter that has been installed.
       */
      return this.trigger('adapter_installed', this, adapter);
    },

    getAdapter: function() {
      return adapter;
    },

    /**
     * Tell the plug-in whether the cache adapter is available for use.
     *
     * IE, localStorage might not be supported on the current browser, in which
     * case you should pass false and caching will be transparently disabled.
     *
     * @fires available
     */
    setAvailable: function(flag) {
      this.__ensureAdapterSet();

      hasCache = flag;

      /**
       * @event available
       *
       * A storage adapter has been installed and Backbone.Cache is ready to
       * be used.
       *
       * @param {Backbone.Cache} Cache
       * The (`this`) Backbone.Cache plugin instance.
       */
      return this.trigger('available', this);
    },

    /**
     * Whether an adapter is installed and is available for use.
     *
     * @note
     * An adapter being available does not necessarily mean that caching will
     * be enabled. The adapter must be both available and the plugin enabled
     * for caching to be enabled.
     *
     * See #isEnabled
     */
    isAvailable: function() {
      this.__ensureAdapterSet();

      return hasCache;
    },

    /**
     * If available,
     *
     * @note An adapter must be set first using #setAdapter.
     *
     * @fires enabled
     */
    enable: function() {
      if (!this.isEnabled() && (useCache = this.isAvailable())) {

        /**
         * @event enabled
         *
         * A storage adapter is available and the plugin was disabled, and has
         * just been enabled.
         *
         * @param {Backbone.Cache} Cache
         * The (`this`) Backbone.Cache plugin instance.
         */
        this.trigger('enabled', this);
      }

      return this;
    },

    /**
     * Turn off caching for all modules.
     *
     * @fires disabled
     */
    disable: function() {
      useCache = false;

      /**
       * @event disabled
       *
       * Backbone entities will no longer be cached.
       *
       * @param {Backbone.Cache} Cache
       * The (`this`) Backbone.Cache plugin instance.
       */
      return this.trigger('disabled', this);
    },

    /**
     * Whether an adapter is set, is available, and the plugin (and caching) enabled.
     */
    isEnabled: function() {
      return this.isAvailable() && useCache;
    },

    /** @private */
    __ensureAdapterSet: function() {
      if (!adapter) {
        throw this.name + ': you must set an adapter first! use #setAdapter';
      }
    },
  });
});