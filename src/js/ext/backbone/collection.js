define([ 'backbone' ], function(Backbone) {
  'use strict';

  /**
   * @class  Backbone.Collection
   *
   * Pibi.js Backbone.Collection extensions.
   */
  _.extend(Backbone.Collection.prototype, {
    name: 'Collection',

    toString: function() {
      return [ this.name, this.id || this.cid ].join('#');
    }
  });  // Backbone.Collection.prototype extensions

  return Backbone.Collection;
});