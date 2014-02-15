/**
 * @class Handlebars
 *
 * Handlebars helpers for use in `.hbs` templates.
 */
define([ 'lodash', 'Handlebars', 'inflection' ],
function(_, Handlebars) {
  'use strict';

  /**
   * @method  uppercase
   *
   * Uppercase a string.
   */
  Handlebars.registerHelper('uppercase', function (word) {
    return word.toUpperCase();
  });

  /**
   * @method  capitalize
   *
   * Capitalize a word.
   */
  Handlebars.registerHelper('capitalize', function (word) {
    return word.capitalize();
  });

  /**
   * @method  pluck_and_join
   *
   * Pluck an attribute from an array of objects and concatenate them using
   * some delimiter.
   *
   * @param  {Object[]} arr
   * The objects to pluck.
   *
   * @param  {String} key
   * The attribute to pluck from the objects.
   *
   * @param  {String} [concat=',']
   * The delimiter to concatenate with.
   *
   * @return {String}
   * The delimited version of the plucked attributes.
   *
   *      @example
   *      // in your js somewhere
   *      objects = [
   *        {
   *          name: "a",
   *          color: "red"
   *        },
   *        {
   *          name: "b",
   *          color: "yellow"
   *        }
   *      ];
   *
   *      // then in a template:
   *      {{pluck_and_join objects "color"}} // => "red, yellow"
   */
  Handlebars.registerHelper('pluck_and_join', function(arr, key, concat) {
    return _.pluck(arr, key).join(concat || ', ');
  });

  /**
   * @method colorize
   *
   * Classify a numerical balance (like an account balance) as positive or negative.
   * Useful for adding a css class to colorize an element reporting a balance.
   *
   * @param  {Number} balance
   * The balance to be testing.
   *
   * @return {String}
   * 'negative' if the balance is less than zero, 'positive' otherwise
   */
  Handlebars.registerHelper('colorize', function(balance) {
    return balance >= 0 ? 'positive' : 'negative';
  });

  /**
   * @method booleanize
   *
   * Human-readable version of a boolean.
   *
   * @param  {Boolean} flag
   * The flag to test.
   *
   * @return {String}
   * 'Yes' or 'No', based on flag.
   */
  Handlebars.registerHelper('booleanize', function(flag) {
    return flag ? 'Yes' : 'No';
  });

  Handlebars.registerHelper('if_eq', function(context, options) {
    if (context == options.hash.compare) {
      return options.fn(this);
    }

    return options.inverse(this);
  });

  Handlebars.registerHelper('ifeq', function(options) {
    for (var key in options.hash) {
      if (this[key] !== options.hash[key]) {
        return options.inverse(this);
      }
    }

    return options.fn(this);
  });


  Handlebars.registerHelper('is_empty', function(str, out) {
    return (str || '').length === 0 ? out : '';
  });

  Handlebars.registerHelper('stringify', function(str) {
    return JSON.stringify(str, undefined, 2);
  });

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

  Handlebars.registerHelper('set', function(options) {
    var key;

    for (key in options.hash) {
      this[key] = options.hash[key];
    }

    return '';
  });

  Handlebars.registerHelper('dialogClasses', function() {
    var klasses = [];
    var klassMap = {
      thin: 'thin-dialog',
      centered: 'align-center'
    };

    _.each([ 'thin' ], function(klass) {
      if (this[klass]) {
        klasses.push(klassMap[klass] || klass);
      }
    }, this);

    return klasses.join(' ');
  });

  return {};
});
