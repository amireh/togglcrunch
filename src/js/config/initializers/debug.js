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
  Backbone.Registry.addDependency('applicationRouter', DEBUG);
  Backbone.Registry.addDependency('viewport', DEBUG);

  _.defer(function() {
    DEBUG.user.set('name', 'Ahmad');

    DEBUG.state.date = moment.utc('2014-02-13', 'YYYY-MM-DD');
    DEBUG.user.on('change:workspaces', function(ws) {
      setTimeout(function() {
        if (!DEBUG.applicationRouter.isAuthorized()) {
          return;
        }

        DEBUG.applicationRouter.redirectTo(
          '/workspaces/' + DEBUG.user.workspaces.first().get('id'));
      }, 10);
    });
  });

  DEBUG.pikaday = pikaday;

  Root.DEBUG = Root.d = DEBUG;
});