define([ 'backbone.nested', 'ext/backbone/plugin' ], function(Nested, Plugin) {
  /**
   * @class Backbone.Plugin.DeepModels
   * @extends Backbone.Plugin
   *
   * Register Backbone.DeepModel as a resource type.
   */
  return Plugin.extend({
    name: 'DeepModels',
    version: '0.1.0',

    setup: function() {
    },

    cleanup: function() {
    },

    // don't do anything, DeepModel exports itself
    export: function() {
      return this;
    }

  });
});