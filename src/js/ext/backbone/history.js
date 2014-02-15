define([ 'backbone' ], function(Backbone) {
  'use strict';

  var normalize = function(fragment) {
    if (!fragment || !fragment.length) {
      fragment = '/';
    }

    if (fragment[0] !== '/') {
      fragment = '/' + fragment;
    }

    return fragment;
  };

  var navigate = Backbone.history.navigate;
  var loadUrl = Backbone.history.loadUrl;

  /**
   * @class Backbone.History
   *
   * Pibi.js Backbone.History extensions.
   */
  _.extend(Backbone.history.prototype, {
    /**
     * @cfg {Number} [trackerLimit=50]
     *
     * The maximum number of routes to keep track of.
     */
    trackerLimit: 50,

    /**
     * @property {String[]} routeHistory
     *
     * A history of the visited URIs during this Backbone session..
     */
    routeHistory: [],

    /**
     * Make Backbone.history fire a 'navigate' event everytime it navigates and
     * track all the navigated routes.
     */
    navigate: function(fragment, options) {
      fragment = normalize(fragment);
      fragment = normalize(this.getFragment(fragment));
      this.fragment = normalize(this.fragment);

      var hasChanged = this.fragment !== fragment;
      var out = navigate.apply(this, arguments);

      if (!hasChanged) {
        return out;
      }

      if (_.last(this.routeHistory) !== fragment) {
        this.routeHistory.push(fragment);
      }

      if (this.routeHistory.length > this.trackerLimit) {
        this.routeHistory.splice(0,1);
      }

      /**
       * @event navigate
       *
       * Marks that the Backbone.history object has just successfully navigated
       * to a new route.
       *
       * **This event is triggered on `Backbone`.**
       *
       * @param {String} fragment
       * The URI of the new route.
       */
      this.trigger('navigate', fragment);

      return out;
    }
  }); // Backbone.History.prototype extensions

  return Backbone.history;
});