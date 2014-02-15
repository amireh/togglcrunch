define([ 'view', 'hbs!datepicker', 'pikaday'], function(View, Template, Pikaday) {
  'use strict';

  return View.extend({
    name: 'DatepickerView',
    template: Template,
    requires: [ 'state' ],

    mount: function() {
      this.picker = new Pikaday({
        field: this.$('#datepicker')[0],
        onSelect: _.bind(this.changeDate, this)
      });
    },

    templateData: function() {
      return {
        date: this.state.date.format('LL')
      }
    },

    changeDate: function() {
      this.state.set('date', this.picker.getMoment());
    }
  });
});