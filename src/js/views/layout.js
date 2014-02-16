define([
  'view',
  'views/statusbar'
], function(View, StatusbarView) {
  'use strict';

  return View.extend({
    container: '#main',
    // template: Template,

    children: [
      StatusbarView
    ],

    requires: [],

    mount: function() {
      this.statusbar = _.findWhere(this._children, { name: 'Statusbar' });
    }
  });
});