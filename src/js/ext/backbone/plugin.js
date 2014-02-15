define([ 'lodash', 'backbone', 'inflection' ], function(_, Backbone) {
  var REQUIRED_METHODS = [ 'setup', 'cleanup', 'export' ];

  /**
   * @class Backbone.Plugin
   *
   * Plugins that provide drop-in functionality for Backbone applications.
   *
   * Backbone Plugins can be integrated with each other through a dependency
   * interface and can be managed through the {@link Backbone.PluginManager Plugin Manager}.
   *
   * @inheritable
   */
  var Plugin = Backbone.Model.extend({
    idAttribute: 'name',

    /**
     * @cfg {String} name
     *
     * Unique name this plugin will be defined in. This must be a snake_cased
     * string (and not a camelCased one).
     *
     * A 'fully-qualified' version of this name attribute is generated via
     * Plugin#fqns, and is used for exporting the plugin definition.
     *
     * Name conflicts will result in an exception thrown at initialization.
     */
    name: 'Plugin',

    /**
     * @cfg {String} [version=0.1.0]
     *
     * The version of this plugin. Maintaining a genuine version string will allow
     * other dependencies to reliably specify their dependency.
     */
    version:   '0.1.0',

    /**
     * @cfg {String} [bbVersion=1.0.0]
     *
     * The Backbone version this plugin is compatible with. Keyword string 'any',
     * or a null value will expect that this plugin has no BB version dependency.
     */
    bbVersion: '1.0.0',

    /**
     * @cfg {String[]}
     * Other plugins that this plugin can integrate with.
     *
     * For each plugin name defined and installed, this plugin instance will
     * get a chance to setup (and cleanup) against it.
     *
     * Sister plugin setup methods are named after the following pattern:
     *
     *     setupPluginFullyQualifiedName: function(plugin) {
     *     }
     *
     * Example: integrating with a plugin named Renderable
     *
     *     setupRenderable: function(renderable) {
     *       this.listenTo(renderable, 'action', this.onRenderableAction);
     *     }
     *
     *     cleanupRenderable: function(renderable) {
     *       this.stopListening(renderable);
     *     }
     *
     * If you're unsure about the FQNS, run `this.fqns()`.
     */
    sisters:   [],

    dependencies: [],

    /**
     * Don't override this directly, use #setup to handle plugin setup.
     *
     * @private
     */
    initialize: function() {
      // plugin needs a name
      if (!this.name || !this.name.length) {
        throw 'Backbone.Plugin: missing "name" definition!';
      }
      // validate the name pattern, must be a snake cased one
      else if (this.name != this.name.underscore().camelize()) {
        throw 'Backbone.Plugin: bad name "' + this.name + '", must be a ' +
          'CamelCased string.';
      }

      // verify required method implementations have been defined
      _.each(REQUIRED_METHODS, function(method_id) {
        if (!this[method_id]) {
          throw [
            'Backbone.Plugin', '[', this.fqns(), ']: ',
            'missing method implementation #',
            method_id
          ].join('');
        }
      }, this);

      if (this.dependencies) {
        _.each(this.dependencies, function(idPlugin) {
          if (!Backbone.PluginManager.getPlugin(idPlugin)) {
            throw this.fqns() + ': plugin dependency not loaded "' + idPlugin + '"';
          }
        }, this);
      }

      this.set({ name: this.name }, { silent: true });
    },

    /**
     * Initialize the plugin and set up any required resources.
     *
     * If the plugin can not be set up, you must throw an exception (and not just
     * return false or null).
     */
    setup: function() {
    },

    /**
     * Undo the allocations and setups done in #setup. You can safely assume
     * that #cleanup will not be called unless #setup was called and was successful.
     *
     * **This method must not throw an exception.**
     */
    cleanup: function() {
    },

    export: function() {
      var exports = this.exports || [ this.fqns() ];

      _.each(exports, function(key) {
        if (Backbone[key]) {
          throw 'Backbone.Plugin: possible plugin conflict, ' +
                'Backbone.' + key + ' has already defined.';
        }

        Backbone[key] = this[key] || this;
      }, this);

      return true;
    },

    /**
     * Fully-qualified name; a camel-cased version of the plugin name.
     *
     * This is the version of the name that will be exposed directly to Backbone.
     */
    fqns: function(str) {
      // return (str || this.name).classify().concat();
      return (str || this.name).
        replace(/([a-z])([A-Z])/, '$1 $2').
        replace(/\s/, '_').
        camelize();
    },

    log: function() {
      var params = _.flatten(arguments || []);

      params.unshift('[Backbone.' + this.fqns() + ']:');

      return console.log.apply(console, params);
    }
  });

  return Plugin;
});