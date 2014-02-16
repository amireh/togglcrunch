requirejs.config({
  baseUrl: '/src/js',
  paths: {
    'text': '../../vendor/js/require/text',
    'jquery': '../../vendor/js/jquery/jquery-2.0.2',
    'jquery.jquerypp': '../../vendor/js/jquery/jquerypp.custom',
    'when': '../../vendor/js/when',
    'store': '../../vendor/js/store',
    'lodash': '../../vendor/js/lodash/lodash.custom',
    'underscore': '../../vendor/js/lodash/lodash.custom',
    'backbone': '../../vendor/js/backbone/backbone',
    'backbone.nested': '../../vendor/js/backbone/deep-model',
    'pikaday': '../../vendor/js/pikaday',
    'inflection': '../../vendor/js/inflection',
    'moment': '../../vendor/js/moment',
    'moment-range': '../../vendor/js/moment-range',
    'd3': '../../vendor/js/d3.v3',
    'Handlebars': '../../vendor/js/handlebars',
    'hbs': '../../vendor/js/require/hbs',
    'i18next': '../../vendor/js/i18next/i18next.amd-1.6.3',
    'defaultLocale': 'config/defaultLocale.json'
  },

  shim: {
    'jquery': { exports: 'jQuery' },
    'jquery.jquerypp': [ 'jquery' ],
    'lodash': { exports: '_' },
    'underscore': { exports: '_' },
    'store': { exports: 'store' },
    'moment': { exports: 'moment' },
    'moment-range': [ 'moment' ],
    'inflection': [],
    'pikaday': { exports: 'Pikaday', deps: [ 'lodash', 'moment' ] },
    'd3': { exports: 'd3' },
    'Handlebars': { exports: 'Handlebars' },
    'defaultLocale': [],
    'backbone': {
      exports: 'Backbone',
      deps: [ 'jquery', 'lodash' ]
    },
    'backbone.nested': [ 'backbone', 'lodash' ]
  },

  hbs: {
    templateExtension:  '',
    disableI18n:        true,
    disableHelpers:     true
  }
});

require([
  'config/initializer',
  'core/viewport',
  'router',
  'models/state'
], function(initialize, Viewport, Router, State) {
  // Transform the blunt 'App' object into Core::State.
  //
  // App so far may contain callbacks by external scripts found in App.Callbacks
  // which we've extracted above.
  App = {};

  initialize()
  .then(function() {
    return Viewport.start();
  })
  .then(function() {
    return State.fetch().then(function() {
      if (State.get('apiToken')) {
        return State.user.fetch();
      }
      else {
        return true;
      }
    });
  })
  .always(function() {
    return Router.start(true);
  })
  .catch(function(e) {
    _.defer(function() {
      console.warn('Boot error:');
      throw e;
    });
  });
});