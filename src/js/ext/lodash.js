/**
 * @class lodash
 *
 * Pibi.js lodash extensions.
 */
define([ 'lodash' ], function() {
  var defer = _.defer;

  if (!_.trunc) {
    _.trunc = function(s, n,  ellip){
      var p  = new RegExp('^(.{0,' + n + '}[\\S]*)', 'g');
      var re = s.match(p);
      var l  = re[0].length;

      re = re[0].replace(/\s$/,'');

      return l < s.length ? re + (ellip || '&hellip;') : s;
    };
  }

  /**
   * @method randomChar
   *
   * A random alphabetical uppercase letter.
   *
   * @return {String}
   * The character.
   */
  _.randomChar = function() {
    return String.fromCharCode(_.random(26)+65); //A-Z
  };

  /**
   * @method sanitize
   *
   * Sanitize a string by removing non-word characters, and by grouping consecutive
   * occurencies of a certain delimiter.
   *
   * @param  {String} str The string to sanitize.
   * @param  {String} [delim='-'] The delimiter to group.
   * @return {String}
   * The sanitized version.
   */
  _.sanitize = function(str, delim) {
    delim = delim || '-';

    return (str||'')
      .toLowerCase()
      .replace(/\W/, delim)
      .replace(RegExp(delim + '+'), delim);
  };

  /**
   * @method isRTL
   *
   * Check if the given locale maps to an RTL language.
   *
   * @param  {String} locale
   * Two-character language code, ie: `en`, `ar`, `cz`.
   *
   * @return {Boolean}
   * Whether it's an RTL language code.
   */
  _.isRTL = function(locale) {
    return _.indexOf([ 'ar' ], locale) > -1;
  };

  /**
   * @method  defer
   *
   * Defers executing the `func` function until the current call stack has cleared.
   * Additional arguments will be passed to `func` when it is invoked.
   *
   * @param  {Function} func
   * The function to be deferred.
   *
   * @param  {Object} [thisArg=null]
   * The `this` context to apply the function as.
   *
   * @return {Number}
   * The timer id as returned by `setTimeout`.
   */
  _.defer = function(func, thisArg) {
    if (!thisArg) {
      return defer(func);
    }

    return defer(_.bind.apply(null, arguments));
  };

  return _;
});