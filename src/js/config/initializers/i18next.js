define([
  'require',
  'config',
  'i18next',
  'text!defaultLocale',
  'when'
], function(require, Config, i18n, defaultLocale, when) {

  /**
   * @class  Pibi.Util.i18n
   *
   * i18n provider.
   */

  /**
   * @method  queryLocale
   * @private
   *
   * Query the requested locale based on the URI.
   * Locale specifier is expected to be the first fragment of the pathname:
   *    http://www.domain.com/XY[extra/fragments]
   * Where XY is the locale code.
   *
   * In case the code is missing, we fall back to Config#defaultLocale.
   *
   * @return {String} The locale code.
   */
  function queryLocale() {
    var locale = Config.defaultLocale;
    var query = document.location.pathname.match(/^\/([a-z]{2})(\b|\/)/);

    if (query) {
      locale = query[1].toLowerCase();
    }

    console.debug('Locale:', locale);

    return locale;
  }

  function init(userLocale, status) {
    var namespaceRegex = /([\w|_]+\.)+/;
    // The locale data that will be available for use by the application.
    var locales = {};

    // Localization namespace, used internally by i18next and not by us.
    var namespace = 'translation';

    // i18next config.
    var config  = {
      lng: locale,
      fallbackLng: 'en',
      supportedLngs: Config.availableLocales,
      load: false,
      ns: { namespaces: [ namespace ], defaultNs: namespace },
      useCookie: false,
      useLocalStorage: false,
      lowerCaseLng: true,
      getAsync:   false,
      fallbackOnNull: true,
      resGetPath: '/assets/locales/__lng__.json',
      detectLngFromHeaders: false,
      dynamicLoad: false,
      postProcess: 'ensureFallback'
    };

    locales.en = {};
    locales.en[namespace] = JSON.parse(defaultLocale).en;

    if (userLocale) {
      try {
        locales[locale] = {};
        locales[locale][namespace] = JSON.parse(userLocale)[locale];
      } catch(e) {
        console.log('Locale error! Unable to parse locale data: ', userLocale);

        // Die hard on development, this is most probably a missing locale.
        //
        //>>excludeStart("production", pragmas.production);
        status.reject(e.message);
        //>>excludeEnd("production");

        // Gracefully fallback to 'en'
        config.lng = locale = 'en';
      }
    }

    config.resStore = locales;

    //>>excludeStart("production", pragmas.production);
    config.debug = true;
    //>>excludeEnd("production");

    i18n.addPostProcessor("ensureFallback", function(value, key/*, options*/) {
      if (value === key) {
        return value.replace(namespaceRegex, '');
      }

      return value;
    });

    i18n.init(config);

    var t = i18n.t;
    i18n.t = function(key, defaultValue) {
      if (_.isString(defaultValue)) {
        return t(key, { defaultValue: defaultValue });
      }

      return t.apply(this, arguments);
    };

    window.i18n = i18n;

    status.resolve();
  }

  var locale = window.locale = queryLocale();

  return function() {
    var status = when.defer();

    if (_.contains(Config.availableLocales, locale) && locale != 'en') {
      require([ 'text!/assets/locales/' + locale + '.json' ], function(userLocale) {
        init(userLocale, status);
      });
    } else {
      locale = window.locale = 'en';
      init(null, status);
    }

    return status.promise;
  };
});