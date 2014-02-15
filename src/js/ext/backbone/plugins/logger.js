/* global Backbone: false */
define([ 'ext/backbone/plugin' ], function(Plugin) {
  var CONTEXT = 'log';
  var Logger = {
    log: function() {
      var params;
      var loggerId = _.reject([ this.name, this.id || this.cid ], function(p) {
        return !p;
      }).join('#');

      params = _.flatten(arguments || []);
      params.unshift('[' + loggerId + ']: ');

      //>>excludeStart("production", pragmas.production);
      if (navigator.userAgent.indexOf("Chrome") > -1) {
        var err = new Error();
        var fileTokens = String(err.stack).split('\n')[3].trim();

        params.push('(at ' + fileTokens.match(/(http[^\)]+)/)[0] + ')');
      }
      //>>excludeEnd("production");

      return console[CONTEXT].apply(console, params);
    },

    mute: function() {
      this.__log  = this.log;
      this.log    = function() {};
    },

    unmute: function() {
      this.log    = this.__log;
      this.__log  = null;
    },
  };

  _.each([ 'debug', 'info', 'warn', 'error' ], function(logContext) {
    Logger[logContext] = function() {
      var out;
      CONTEXT = logContext;
      out = this.log.apply(this, arguments);
      CONTEXT = 'log';
      return out;
    };
  });

  /**
   * @class Backbone.Plugin.Logger
   * @extends Backbone.Plugin
   *
   * Extend Backbone resources with logging functionalities that utilize the
   * identity of the resource to prefix all its logging messages.
   *
   *  @example
   *
   *    var user = new User({ id: 5 });
   *    user.log('Hello.'); // => [User#5]: Hello.
   *    user.debug('Hello.');
   *    user.info('Hello.');
   *    user.warn('Hello.');
   *    user.error('Hello.');
   */
  return Plugin.extend({
    name: 'Logger',
    exports: 'Logger',
    version: '0.1.0',

    setup: function() {
      _.extend(Backbone.Model.prototype,      Logger);
      _.extend(Backbone.Collection.prototype, Logger);
      _.extend(Backbone.View.prototype,       Logger);
      _.extend(Backbone.Router.prototype,     Logger);
      _.extend(Plugin.prototype,     Logger);
    },

    cleanup: function() {
    },

    export: function() {
      Backbone.Logger = Logger;

      return Logger;
    }
  });
});