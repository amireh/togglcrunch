/**
 * @class lodash
 *
 * Pibi.js lodash extensions.
 */
define([ 'lodash' ], function() {
  var defer = _.defer;

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