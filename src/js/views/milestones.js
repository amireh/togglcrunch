define([ 'view', 'hbs!milestones', 'views/datepicker' ], function(View, Template, DPView) {
  'use strict';

  return View.extend({
    name: 'MilestonesView',
    template: Template,

    requires: [ 'user', 'state' ],
    // children: [ DPView ],

    mount: function() {
      this.listenTo(this.user.timeEntries, 'reset', this.reload);
      this.listenTo(this.state, 'loading:timeEntries', this.hide);
      this.listenTo(this.state, 'loaded:timeEntries', this.show);

      this.$('[data-width]').each(function() {
        _.defer(function() {
          $(this).css('width', $(this).data('width'));
        }, this);
      });
    },

    hide: function() {
      this.$el.animate({ opacity: 0.25 }, 250);
    },

    show: function() {
      this.$el.animate({ opacity: 'show' }, 750);
    },

    getMilestones: function() {
      return this.state.get('milestones');
    },

    templateData: function() {
      return {
        milestones: this.getMilestones(),
        month: this.parseMonthData(this.state.date, this.user.timeEntries),
        weeks: this.parseWeeksData(this.state.date, this.user.timeEntries),
        day: this.parseDayData(this.state.date, this.user.timeEntries)
      };
    },

    parseWeeksData: function(date, timeEntries) {
      var entries = [];
      var month = date.month();
      var data = {
        label: date.format('MM/YYYY'),
        weeklyRatios: [],
        hours: 0
      };

      entries.push(timeEntries.weekEntries(1, month));
      entries.push(timeEntries.weekEntries(2, month));
      entries.push(timeEntries.weekEntries(3, month));
      entries.push(timeEntries.weekEntries(4, month));

      data.weeklyRatios = _(entries).map(function(entries, index) {

        var weekData = {
          index: index+1,
          ratio: this.ratioFor(entries, 'weekly'),
          hours: entries.hours()
        };

        data.hours += weekData.hours;

        return weekData;
      }, this);

      return data;
    },

    parseDayData: function(date, timeEntries) {
      var data = {
        label: date.calendar()
      };

      data.entries = timeEntries.dayEntries();
      data.ratio = this.ratioFor(data.entries, 'daily');
      data.hours = data.entries.hours();

      return data;
    },

    parseMonthData: function(date, timeEntries) {
      var data = {
        label: date.format('MMMM, YYYY')
      };

      data.entries = timeEntries;
      data.ratio = this.ratioFor(data.entries, 'monthly');
      data.hours = data.entries.hours();

      return data;
    },

    ratioFor: function(entries, milestone) {
      var ratio = entries.hours() / this.getMilestones()[milestone] * 100;

      if (ratio > 100) {
        ratio = 100.0;
      }

      return ratio;
    }
  });
});