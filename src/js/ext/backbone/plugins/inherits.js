/* global Backbone: false */
define([ 'ext/backbone/plugin', 'util/inherit' ], function(Plugin, Inherit) {
  'use strict';

  /**
   * @class Backbone.Plugin.Inherits
   * @extends Backbone.Plugin
   *
   * Enables inheritance of attributes for any Backbone resource.
   */
  return Plugin.extend({
    name: 'Inherits',
    version: '0.1.0',
    bbVersion: '1.0.0',
    dependencies: [ 'Sentinel' ],

    targets: [ 'model', 'view', 'collection', 'widget' ],

    setup: function() {
      _.each(this.targets, function(target) {
        this.listenTo(Backbone, [ target, 'creating' ].join(':'), this.inheritAttributes);
      }, this);
    },

    inheritAttributes: function(resource) {
      var chain = Inherit(resource, 'inherits', true, true);

      if (chain && chain.length) {
        _.each(chain, function(attr) {
          var isArray = attr[0] == '@';

          if (isArray) {
            attr = attr.substr(1);
          }

          Inherit(resource, attr, false, isArray);
        });
      }
    },

    export: function() {}
  });
});