define([
  'ext/jquery',
  'ext/backbone',
  'views/layout'
], function($, Backbone, Layout) {

  var Director = Backbone.View.extend({
    el: 'body',

    requires: [ 'viewport', 'state' ],

    initialize: function() {
    },

    initWithViewport: function(viewport) {
      viewport.setLayout(new Layout);
    },

    initWithState: function(state) {
    }
  });

  return new Director;
});