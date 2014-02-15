define([ 'view', 'hbs!milestones' ], function(View, Template) {
  'use strict';

  return View.extend({
    name: 'MilestonesView',
    template: Template,

    requires: [ 'user', 'state' ],

    mount: function() {
      this.listenTo(this.user.timeEntries, 'reset', this.reload);
      // this.listenTo(this.state, 'change:date', this.reload);

      this.$('[data-width]').each(function() {
        _.defer(function() {
          $(this).css('width', $(this).data('width'));
        }, this);
      });
    },

    getMilestones: function() {
      return {
        monthly: 160,
        weekly: 40.0,
        daily: 8
      };
    },

    templateData: function() {
      return {
        milestones: this.getMilestones(),
        month: this.parseMonthData(this.state.date, this.user.timeEntries),
        day: this.parseDayData(this.state.date, this.user.timeEntries)
      };
    },

    parseMonthData: function(date, timeEntries) {
      var entries = [];
      var month = date.month();
      var data = {
        label: date.format('MMMM, YYYY'),
        weeklyRatios: []
      };

      entries.push(timeEntries.weekEntries(1, month));
      entries.push(timeEntries.weekEntries(2, month));
      entries.push(timeEntries.weekEntries(3, month));
      entries.push(timeEntries.weekEntries(4, month));

      data.weeklyRatios = _(entries).map(function(entries, index) {
        return {
          index: index+1,
          ratio: this.ratioFor(entries, 'weekly')
        }
      }, this);

      return data;
    },

    parseDayData: function(date, timeEntries) {
      var data = {
        label: date.format('DD[/]MM[/]YYYY')
      };

      data.entries = timeEntries.dayEntries();
      data.ratio = this.ratioFor(data.entries, 'daily');

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