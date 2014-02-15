var Root = this;
var DEBUG = {
  toString: function() {
    return 'DEBUG';
  }
};

define([
  'config',
  'when',
  'pikaday',
  'ext/backbone'
],
function(CONFIG, when, pikaday, Backbone) {
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

  Backbone.Registry.addDependency('user', DEBUG);
  Backbone.Registry.addDependency('state', DEBUG);


  _.defer(function() {
    if (this.App) {
      App.ApplicationView.refreshApiToken();
    };

    DEBUG.state.date = moment.utc('2014-02-13', 'YYYY-MM-DD');
  });

  DEBUG.pikaday = pikaday;

  Root.DEBUG = Root.d = DEBUG;
});