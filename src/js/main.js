requirejs.config({
  baseUrl: '/src/js',
  paths: {
    'text': '../../vendor/js/require/text',
    'jquery': '../../vendor/js/jquery/jquery-2.0.2',
    'jquery.jquerypp': '../../vendor/js/jquery/jquerypp.custom',
    'when': '../../vendor/js/when',
    'store': '../../vendor/js/store',
    'lodash': '../../vendor/js/lodash/lodash.custom',
    'pikaday': '../../vendor/js/pikaday',
    'inflection': '../../vendor/js/inflection',
    'moment': '../../vendor/js/moment',
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
    'store': { exports: 'store' },
    'moment': { exports: 'moment' },
    'inflection': [],
    'pikaday': { exports: 'Pikaday', deps: [ 'lodash', 'moment' ] },
    'd3': { exports: 'd3' },
    'Handlebars': { exports: 'Handlebars' },
    'defaultLocale': []
  },

  hbs: {
    templateExtension:  '',
    disableI18n:        true,
    disableHelpers:     true
  }
});

require([ 'config/initializer' ], function(initialize) {
  // Transform the blunt 'App' object into Core::State.
  //
  // App so far may contain callbacks by external scripts found in App.Callbacks
  // which we've extracted above.
  App = {};

  initialize().catch(function(e) {
    _.defer(function() {
      console.warn('Boot error:');
      throw e;
    });
  });
});