/**
 * @class Handlebars
 *
 * Handlebars helpers for use in `.hbs` templates.
 */
define([ 'lodash', 'Handlebars', 'inflection' ],
function(_, Handlebars) {
  'use strict';

  /**
   * @method t
   *
   * Localize a string.
   *
   * @param  {String} key
   * The fully-qualified i18n key defined in the locale file.
   *
   * @param  {Mixed} options
   * Context or additional data to pass to i18n.
   *
   * @return {String}
   * The localized version.
   */
  Handlebars.registerHelper('t', function(key, translation, options) {
    if (_.isString(translation)) {
      options.hash.defaultValue = translation;
    }
    else {
      options = translation;
    }

    return new Handlebars.SafeString(i18n.t(key, options.hash));
  });

  Handlebars.registerHelper('float', function(value) {
    return new Handlebars.SafeString(parseFloat(value).toFixed(2));
  });

  Handlebars.registerHelper('colorize', function(ratio) {
    var klass = '';
    if (ratio < 24) {
      klass = 'progress-bar-danger';
    }
    else if (ratio < 49) {
      klass = 'progress-bar-warning';
    }
    else if (ratio < 74) {
      klass = 'progress-bar-info';
    }
    else {
      klass = 'progress-bar-success';
    }

    return new Handlebars.SafeString(klass);
  });

  return {};
});
