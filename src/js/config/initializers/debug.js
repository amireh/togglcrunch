var Root = this;
var DEBUG = {
  toString: function() {
    return 'DEBUG';
  }
};

define([
  'config',
  'when',
  'pikaday'
],
function(CONFIG, when, pikaday) {
  Root.TRACE = function() {
    try {
      throw new Error();
    } catch (e) {
      console.debug('@TRACE@');
      console.debug(e.stack);
    }
  };

  DEBUG.when = Root.when = when;
  DEBUG.onError = function(err) {
    console.error('Exception raised in promise chain:', err);

    if (err.stack) {
      console.assert(false, err.stack);
    }

    return false;
  };

  DEBUG.pikaday = pikaday;

  Root.DEBUG = Root.d = DEBUG;
});