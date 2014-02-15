define([ 'backbone' ], function(Backbone) {
  'use strict';

  var route = Backbone.Router.prototype.route;

  _.extend(Backbone.Router.prototype, {
    /**
     * @override
     *
     * Installs a reference to the router in the Backbone.History registered
     * handler construct. This allows us to reference the router when the
     * history is about to navigate to one of its endpoints.
     *
     * The router can be found at:
     *
     * Backbone.history.handlers[0].router;
     */
    route: function() {
      route.apply(this, arguments);

      Backbone.history.handlers[0].router = this;

      return this;
    },

    toString: function() {
      return this.name || this.id;
    }
  }); // Backbone.Router.prototype extensions

  return Backbone.Router;
});