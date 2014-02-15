/* global Backbone: false */
define([ 'ext/backbone/plugin' ], function(Plugin) {
  if (Backbone.PluginManager) {
    throw 'Backbone.PluginManager: possible plugin conflict, ' +
          'Backbone.PluginManager has already defined.';
  }

  /**
   * @class Backbone.PluginManager
   * An interface for installing and managing Backbone {@link Backbone.Plugin Plugins}.
   *
   * The PluginManager is a {@link Backbone.Plugin Plugin} itself.
   */
  var PluginManager = Plugin.extend({
    name: 'PluginManager',
    version: '0.1.0',

    initialize: function() {
      this.plugins = new Backbone.Collection(null, {
        model: Plugin
      });
    },

    setup: function() {
      // handle sister dependencies
      this.plugins.each(function(plugin) {
        _.each(plugin.sisters || [], function(sisterNs) {
          var sister = this.getPlugin(sisterNs);

          if (sister) {
            var sisterInit = plugin['setup' + sister.fqns() ];
            if (sisterInit) {
              sisterInit.apply(plugin, [ sister ]);
            }
          }
        }, this);
      }, this);
    },

    cleanup: function() {
      var that = this;

      // handle sister dependency cleanup
      this.plugins.each(function(plugin) {
        _.each(plugin.sisters || [], function(sisterNs) {
          var sister = that.getPlugin(sisterNs);
          if (sister) {
            var sisterCleanup = plugin['cleanup' + sister.fqns() ];
            if (sisterCleanup) {
              plugin[sisterCleanup].apply(plugin, [ sister ]);
            }
          }
        });
      });

      this.plugins.each(function(plugin) {
        this.uninstall(plugin);
      }, this);

      this.plugins.reset();
    },

    export: function() {
      return this;
    },

    install: function(plugin, options) {
      try {
        plugin.setup(options);
      } catch(e) {
        this.log('Plugin ' + plugin.fqns() + ' has failed to setup and will not be installed.');
        this.log('Error: ' + e.message);

        //>>excludeStart("production", pragmas.production);
        throw e;
        //>>excludeEnd("production");

        plugin.trigger('invalid', e);

        return false;
      }

      plugin.export();
      plugin.set({ installed: true }, { silent: true });

      this.plugins.add(plugin);

      this.trigger('installed', plugin);
      this.trigger('installed:' + plugin.fqns(), plugin);

      this.log('Plugin installed: ' + plugin.fqns());

      return true;
    },

    uninstall: function(plugin) {
      if (!this.isInstalled(plugin)) {
        return true;
      }

      this.plugins.remove(plugin);

      plugin.cleanup();

      this.trigger('uninstalled', plugin);
      this.trigger('uninstalled:' + plugin.fqns(), plugin);

      return true;
    },

    /**
     * Whether the plugin is defined.
    */
    isRegistered: function(name) {
      return !!this.__lookup(name);
    },

    /**
     * Whether the plugin is defined and installed.
     */
    isInstalled: function(name) {
      var plugin = this.__lookup(name);

      return plugin && plugin.get('installed');
    },

    /**
     * Get an instance of the plugin bound to the given name.
     */
    getPlugin: function(name) {
      return this.__lookup(name);
    },

    /**
     * @private
     */
    __lookup: function(name) {
      if (name instanceof Plugin) {
        name = name.name;
      }

      return this.plugins.get(this.fqns( name ));
    }
  });

  return PluginManager;
});