/* global Backbone: true */
define([ 'ext/backbone/controller', 'ext/backbone/plugin' ], function(Controller, Plugin) {
  'use strict';

  /**
   * @class Backbone.Plugin.Controllers
   * @extends Backbone.Plugin
   *
   * Registers Backbone.Controller as a resource type. See Backbone.Controller
   * for more info.
   */
  return Plugin.extend({
    name: 'Controllers',
    version: '0.1.0',
    bbVersion: '1.0.0',
    dependencies: [ 'Sentinel', 'Registry' ],

    setup: function() {
      Backbone.Registry.sniff('controller');
    },

    cleanup: function() {
    },

    export: function() {
      Backbone.Controller = Controller;
      Backbone.Sentinel.targets.push('Controller');
      Backbone.Sentinel.__wrapTarget('Controller');

      return Controller;
    }
  });
});