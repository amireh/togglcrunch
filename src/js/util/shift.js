define([ 'lodash' ], function() {
  'use strict';

  return function(args, nrShifts) {
    var i;
    var params = _.flatten(args);

    for (i = 0; i < nrShifts; ++i) {
      params.shift();
    }

    return params;
  };
});