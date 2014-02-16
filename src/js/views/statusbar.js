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
      if (percentage === 0) {
        this.hideIndicator();
      }
      else {
        this.showIndicator();
      }

      console.debug('ticking:', percentage);
      this.$('.progress-bar').css({
        width: percentage + '%'
      });
      return this;
    },

    showIndicator: function() {
      this.$('.indicator').animate({
        top: 150,
        right: 150
      }, 350);
    },

    hideIndicator: function() {
      this.$('.indicator').animate({ top: 0, right: 0 }, 350);
    }
  });
});