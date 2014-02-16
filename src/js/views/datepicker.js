define([ 'view', 'hbs!datepicker', 'moment', 'pikaday'],
function(View, Template, moment, Pikaday) {
  'use strict';

  return View.extend({
    name: 'DatepickerView',
    template: Template,
    requires: [ 'state' ],

    mount: function() {
      this.listenTo(this.state, 'change:date', this.reload);
      this.picker = new Pikaday({
        field: this.$('#datepicker')[0],
        trigger: this.$('span[data-action="show"]'),
        onSelect: _.bind(this.changeDate, this),
        onOpen: function() {
          $('body').addClass('shaded');
        },
        onClose: function() {
          $('body').removeClass('shaded');
        },
        position: 'top right'
      });
    },

    onShow: function() {
      this.picker.show();
    },

    templateData: function() {
      return {
        date: this.state.date.format('LL')
      }
    },

    changeDate: function() {
      this.state.date = this.picker.getMoment();
    }
  });
});