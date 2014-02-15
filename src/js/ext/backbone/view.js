define([ 'jquery', 'backbone', 'when' ], function($, Backbone, when) {
  'use strict';

  var remove = Backbone.View.prototype.remove;
  var delegateAction = function(e) {
    var action;

    action = $(e.currentTarget).attr('data-action');
    action = ('on_' + action.underscore()).camelize(true);

    this.consume(e);

    if (!_.isFunction(this[action])) {
      throw new Error(this.toString() + ' has no action handler: ' + action);
    }

    return this[action].apply(this, arguments);
  };

  /**
   * @class Backbone.View
   * Pibi.js Backbone.View extensions.
   *
   * The extensions make heavy use of promises to achieve a robust implementation
   * of view and layout transitioning.
   *
   * They also provide a nice set of helpers to do things like reporting form
   * errors, binding [data-action] handlers, and serializing data.
   */
  _.extend(Backbone.View.prototype, {
    name: 'View',

    inherits: [ 'options' ],

    /**
     * @cfg {String} container
     * A DOM selector for an element to use as a parent for this view.
     * If you specify a container, the view will be automatically _appended_
     * to this element after rendering.
     *
     * See #attachToContainer() for more info.
     */
    container: null,

    consume: function(e) {
      return $.consume(e);
    },

    toString: function() {
      return [ this.name, this.id || this.cid ].join('#');
    },

    load: function() { return true; },

    /**
     * Stock rendering routine. Binds the event and action handlers, and if
     * a Handlebars template was found in `#template`, it will be rendered into
     * `this.$el` with the compound options.
     *
     * > **Note**
     * >
     * > When you override this, make sure you either call this method somewhere
     * > after you set the $el, or fulfill the promise manually yourself.
     *
     * @param  {Object} options
     *         Extra rendering options by the caller.
     *
     * @param  {Resolver} [resolver=null]
     *         A resolver for the rendering promise. You must call
     *         `resolver.resolve();` once you're done rendering, otherwise the
     *         Viewport will never know when the view is ready.
     *
     * @return {this}
     *         Doesn't matter what you return really.
     */
    render: function(options, resolver) {
      var templateData;
      var signalRendered;

      if (_.isFunction(this.template)) {
        templateData = {
          options: this.compoundOptions(options)
        };

        _.extend(templateData, _.result(this, 'templateData', this));

        this.$el = $(this.template(templateData).trim());
      }

      this.delegateEvents();
      this.delegateActions();

      if (resolver && _.isFunction(resolver.resolve)) {
        signalRendered = _.bind(resolver.resolve, resolver);
      }

      this.renderSubviews().then(signalRendered);

      return this;
    },

    /**
     * Execute any post-rendering logic.
     */
    mount: function() {},

    /**
     * Execute any pre-removal logic.
     */
    unmount: function() {},

    /**
     * Dispatch a rendering request, and attach the view to its container after
     * it has been rendered - if viable.
     *
     * @param {Object} [options={}]
     *        Rendering options to pass to #render().
     *
     * @async
     * @return {Promise} Of the view being rendered.
     */
    _render: function(options) {
      var deferred = when.defer();
      var that = this;

      if (this._rendering) {
        this.warn('Rejecting request to render; currently busy.');
        return this._rendering;
      }

      this._rendering = deferred.promise;

      deferred.promise.ensure(function() {
        that._rendering = null;
        that._rendered = true;
      });

      // Once rendered, attach to a container, if any.
      if (this.container) {
        deferred.promise.then(function() {
          return that.attachToContainer()
        });
      }

      // Once rendered, execute any mounting logic.
      deferred.promise.then(function() {
        return that.mount();
      }).otherwise(function(error) {
        that.error('Mounting failed:', error.stack, arguments);
        deferred.reject(error);
      });

      when(that.load()).then(function() {
        return that.render(options, deferred.resolver);
      }).otherwise(function(error) {
        that.error('Rendering failed:', error.stack, arguments);
        deferred.reject(error);
      });

      return deferred.promise;
    },

    isRendered: function() {
      return this._rendered;
    },

    /**
     * Remove the view and clean up any resources it had allocated.
     *
     * This takes care of removing the element from DOM, unbinding all event and
     * action handlers.
     *
     * @param  {Resolver} [resolver=null]
     *         The promise resolver for the removal process which will be
     *         resolved once the view is completely removed.
     *
     * @return {Promise}
     *         Of the view being removed.
     *
     * @warning
     *   If you override this, you must resolve the deferred object, if one is
     *   passed, once you're done removing by calling `resolver.resolve();`,
     *   or just call the super method to let it take care of things.
     *
     * **Example**
     *
     *     Backbone.View.extend({
     *       remove: function(deferred) {
     *         // your clean-up logic here
     *         // ...
     *         return Backbone.View.prototype.apply(this, arguments);
     *       }
     *     });
     */
    remove: function(resolver) {
      var signalRemoved;

      // original remove will take care of unbinding events, as well as removing
      // the view element from the DOM
      remove.apply(this, arguments);

      if (resolver && _.isFunction(resolver.resolve)) {
        signalRemoved = _.bind(resolver.resolve, resolver);
      }

      return when.all([
        this.removeSubviews(),
        this.undelegateActions()
      ], signalRemoved);
    },

    /**
     * Dispatch a removal request.
     * @async
     *
     * @return {Promise} Of the view being removed.
     */
    _remove: function() {
      var deferred = when.defer();
      var that = this;

      if (this._removing) {
        this.warn('Rejecting request to remove; currently busy.');
        return this._removing;
      }

      this._removing = deferred.promise;

      deferred.promise.ensure(function() {
        that._removing = false;
        that._rendered = false;
      });

      this.unmount();

      _.defer(function() {
        this.remove(deferred.resolver);
      }, this);

      return deferred.promise;
    },

    reload: function(options) {
      var that = this;
      var $container;

      // A removal job in progress?
      if (this._removing) {
        this.warn('Will not reload just yet; a removal job is in progress.');

        // Queue a rendering job after the current removal job is done
        return this._removing.ensure(function() {
          return that._render(options);
        });
      }
      // A rendering job in progress?
      else if (this._rendering) {
        this.warn('Will not reload just yet; a rendering job is in progress.');

        // Queue a reloading job after the current render job is done
        return this._rendering.ensure(function() {
          return that.reload(options);
        });
      }
      // Good to reload:
      else {
        $container = this.$el.parent();
        // Queue a removal job followed by a rendering one
        return this._remove().then(function() {
          return that._render(options).then(function(rc) {
            // Re-attach to the previous parent.
            that.$el.appendTo($container);
            return rc;
          });
        });
      }
    },

    /**
     * Bind [data-action] elements to defined handlers.
     *
     * The handler is expected to be named as the camelCased version of the
     * action prefixed by on, examples:
     *
     *    - <button data-action="save" /> => onSave
     *    - <button data-action="sendReport" /> => onSendReport
     *
     */
    delegateActions: function() {
      this.undelegateActions();
      this.$el.on(this.$exclusive('click'), '[data-action]',
        _.bind(delegateAction, this));

      return this;
    },

    /**
     * Unbind action handlers.
     */
    undelegateActions: function() {
      this.$el.off(this.$exclusive('click'), '[data-action]');

      return this;
    },

    serialize: function() {
      return this.$('form').serializeObject();
    },

    /**
     * A nice set of the View's current options mixed in with extra option
     * overrides specified at call-time.
     *
     * @param  {Object} [extraOptions={}]
     *         Option overrides.
     *
     * @return {Object}
     *         The composite set of options.
     */
    compoundOptions: function(extraOptions) {
      return _.extend({}, _.result(this, 'options', this), extraOptions);
    },

    /**
     * @protected
     * @param  {String} event
     *         A DOM event.
     *
     * @return {String}
     *         A jQuery-compatible namespaced event name that will be exclusive
     *         to this view during its lifetime.
     *
     * Example:
     *
     *     var myView;
     *
     *     myView = new Backbone.View();
     *     myView.cid; // => view1
     *     myView.$exclusive('click'); // => 'click.view1'
     *
     *     // binding handlers:
     *     $('body').on(myView.$exclusive('click'), function(e) {
     *       // ...
     *     });
     *
     *     // and later on, we can safely undelegate:
     *     $('body').off(myView.$exclusive('click'));
     */
    $exclusive: function(event) {
      return event + '.' + this.cid;
    },

    /**
     * Attach this view to the configured container.
     *
     * @protected
     */
    attachToContainer: function(selector) {
      var $container;

      $container = $(selector || this.container);

      if ($container.length && this.$el) {
        $container.append(this.$el);
      }
    },

    renderSubviews: function() {
      var that = this;

      this._children = [];

      _.each(this.children, function(viewFactory) {
        var view;

        view = new viewFactory();
        view.container = view.container ||
          this.$('[data-container="' + view.name + '"]');

        if (!view.container.length) {
          view.container = this.$el;
        }

        this._children.push(view);
        this[view.name.demodulize().underscore().camelize(true)] = view;
      }, this);

      return when.all(_.invoke(this._children, '_render'));
    },

    removeSubviews: function() {
      return when.all(_.invoke(this._children, '_remove'));
    }
  });  // Backbone.View.prototype extensions

  return Backbone.View;
});