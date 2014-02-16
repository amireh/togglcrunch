define([
  'ext/jquery',
  'ext/backbone',
  'views/layout'
], function($, Backbone, Layout) {

  var Director = Backbone.View.extend({
    el: 'body',

    requires: [ 'viewport' ],

    initialize: function() {
    },

    initWithViewport: function(viewport) {
      viewport.setLayout(new Layout);
    }
  });

  return new Director;
});