define([ 'view', 'hbs!statusbar' ], function(View, Template) {
  'use strict';

  return View.extend({
    name: 'Statusbar',
    template: Template,

    set: function(message) {
      this.$('#message').text(message);
      return this;
    },

    tick: function(percentage) {
      this.$('#bar').css({
        width: percentage + '%'
      });
      return this;
    }
  });
});