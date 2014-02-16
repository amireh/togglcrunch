define([ 'view', 'hbs!statusbar' ], function(View, Template) {
  'use strict';

  return View.extend({
    name: 'Statusbar',
    template: Template,

    module: 'statusbar',

    set: function(message) {
      this.$('#message').text(message);
      return this;
    },

    tick: function(percentage) {
      console.debug('ticking:', percentage);
      this.$('.progress-bar').css({
        width: percentage + '%'
      });
      return this;
    }
  });
});