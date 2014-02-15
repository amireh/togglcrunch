define([ 'moment', 'moment-range', 'config' ],
function(moment, range, Config) {
  'use strict';

  moment.lang('en', {
    longDateFormat: {
      L: Config.dateFormat,
      LL: Config.dateFormat
    }
  });

});