define([ 'moment', 'moment-range', 'config' ],
function(moment, range, Config) {
  'use strict';

  moment.lang('en', {
    longDateFormat: {
      LT: "HH:mm",
      L: Config.dateFormat,
      LL: Config.dateFormat,
      // LL: "D MMMM YYYY",
      LLL: "D MMMM YYYY LT",
      LLLL: "dddd D MMMM YYYY LT"
    },

    calendar: {
      lastDay:  "[Yesterday]",
      lastWeek: "[Last] dddd",
      nextDay:  "[Tomorrow]",
      nextWeek: "dddd",
      sameDay:  "[Today]",
      sameElse: "D[/]M[/]YYYY"
    }
  });

});