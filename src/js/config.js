define('config', [ 'lodash' ], function(_) {
  /**
   * @class Config
   *
   * Application-wide configuration.
   *
   * This object is exposed to the modules after initialization of the Controller
   * via the application State.
   */
  var productionConfig = {

    version: '1.0.0',
    // This won't work until Toggl put us on the CORS origin whitelist.
    // apiHost: 'https://toggl.com/reports/api/v2',
    apiHost: 'http://api.togglcrunch.com/reports/api/v2',

    dateFormat: 'YYYY[-]MM[-]DD',

    /**
     * The set of available locales, automatically generated by the locale
     * generator script module.
     */
    availableLocales: [
      'en'
    ],

    defaultLocale: 'en',

    xhr: {
      timeout: 15000,
    }
  };

  // development config goes here:
  //

  //>>excludeStart("production", pragmas.production);
  _.merge(productionConfig, {
    apiHost: 'http://localhost:9292/reports/api/v2'
  });
  //>>excludeEnd("production");

  return productionConfig;
});