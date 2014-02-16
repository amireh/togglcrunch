/* global Backbone: false */
define([
  'ext/backbone/router'
], function(Router) {
  'use strict';

  /**
   * @class Backbone.Controller
   */
  var Controller = Router.extend({
    id: 'Controller',

    requires: [ 'viewport' ],

    /**
     * @property {Array<String>|Array<RegExp>} public
     * Routes in this controller that may not be visited while the user is
     * logged in.
     */
    public: [],

    /**
     * @property {Array<String>|Array<RegExp>} protected
     * Routes in this controller that may not be visited by guests.
     */
    protected: [],

    currentRoute: null,

    initialize: function() {
      // Automatically register all controllers in the registry.
      Backbone.Registry.registerModule(this.toString(), this);

      this.on('route', function(name) {
        console.debug('=> #' + name);
        this.currentRoute = Backbone.history.fragment;
      }, this);
    },

    /**
     * Forward a view attachment request to the Viewport.
     */
    render: function(view, options) {
      if (!this.viewport) {
        console.warn('Viewport is unavailable, can not render views.');
        return false;
      }

      return this.viewport.attach(view, options);
    },

    toString: function() {
      return this.id;
    }
  });

  return Controller;
});