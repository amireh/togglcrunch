define([ 'ext/lodash', 'ext/backbone', 'moment' ], function(_, Backbone, moment) {
  var TimeEntry = Backbone.Model.extend({});
  var TimeEntries = Backbone.Collection.extend({
    model: TimeEntry,
    requires: [ 'state' ],

    within: function(start, end) {
      var range = moment.utc().range(start, end);
      var subset = new TimeEntries();
      var entries = this.filter(function(entry) {
        return range.contains(moment.utc(entry.get('start')));
      });

      subset.reset(entries);

      return subset;
    },

    hours: function() {
      return this.duration() / (3600 * 1000);
    },

    minutes: function() {
      return this.duration() / (60 * 1000);
    },

    duration: function() {
      return this.reduce(function(duration, entry) {
        return duration + entry.get('dur');
      }, 0);
    },

    /**
     * Time entries logged in the current date.
     */
    dayEntries: function() {
      var anchor = this.state.date;

      return this.within(
        anchor.clone().startOf('day'),
        anchor.clone().endOf('day'));
    },

    /**
     * Logged time entries in a given week of the current month.
     *
     * @param  {Integer} weekNr Week number from 1 to 4.
     */
    weekEntries: function(weekNr, month) {
      var anchor = this.state.date;
      var thisYear = anchor.year();
      var startOfMonth = moment([ thisYear, month, 1 ]).startOf('month');
      var start = startOfMonth.clone().add('weeks', weekNr-1);
      var end = startOfMonth.clone().add('weeks', weekNr);

      // Extend the range to cover the entire month if it's the last week:
      if (weekNr === 4) {
        end = startOfMonth.clone().endOf('month');
      }

      return this.within(start, end);
    }
  });

  return TimeEntries;
});