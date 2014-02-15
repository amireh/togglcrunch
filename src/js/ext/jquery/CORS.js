/**
 * @class jQuery
 */
define([ 'lodash', 'jquery', 'when' ], function(_, $, when) {
  var CORSInstalled = false;
  var CORSHeaders = {
    'Accept':       'application/json; charset=utf-8',
    'Content-Type': 'application/json; charset=utf-8'
  };
  var POSTHeaders = {
    'Accept':       'application/json; charset=utf-8',
    'Content-Type': 'application/json; charset=utf-8',

    // Must specify no-cache for iOS 6 Safari not to serve POST requests from
    // local cache
    //
    // See: http://stackoverflow.com/questions/12506897/is-safari-on-ios-6-caching-ajax-results
    'Cache-Control': 'no-cache'
  };

  var CORSOptions = {
    host:     '',
    timeout:  10000,
    mutators: []
  };

  /**
   * @method ajaxCORS
   *
   * A CORS implementation of $.ajax. See #CORS for configuring this thing.
   *
   * @param {Object} options
   * The AJAX options to use as documented by jQuery#ajax.
   *
   * @param {Mixed} [thisArg=window]
   * The context to invoke the callbacks in.
   *
   * @async
   */
  function ajaxCORS(options, thisArg) {
    var headers   = CORSHeaders;
    var mutators  = CORSOptions.mutators;

    // a monkey patch to get around jQuery bugging out with non-200 successful statues
    // such as 204 and 205 triggering fail() instead of success()
    //
    // removing the dataType will prevent jQuery from trying to parse the response
    // and failing (204 and 205 responses are not supposed to have any content at all)
    if (options.type == 'DELETE') {
      delete options.dataType;
    }
    else if (options.type == 'POST') {
      headers = POSTHeaders;
    }

    options.url = options.url || '/';

    // Prefix all AJAX requests with the API host
    if (options.url[0] !== '/') {
      options.url = '/' + options.url;
    }

    options.url = [ CORSOptions.host, options.url ].join('');

    _.extend(options.headers || {}, headers);

    for (var i = 0; i < mutators.length; ++i) {
      mutators[i](options);
    }

    if (thisArg) {
      _.each([ 'success', 'error', 'complete' ], function(callback) {
        if (options[callback]) {
          options[callback] = _.bind(options[callback], thisArg);
        }
      });
    }

    return when($.ajax(_.extend({
      xhrFields:  { withCredentials: true },
      timeout:    CORSOptions.timeout
    }, options)));
  };

  /**
   * @method CORS
   *
   * Configure CORS requests.
   *
   * @param {Object} options
   * The CORS options to use for all subsequent requests.
   *
   * @param {String} options.host
   * The origin to use as the base of all XHR requests.
   *
   * @param {Number} [options.timeout=10000]
   * Milliseconds to wait before interrupting the AJAX request.
   *
   * @param {Object} [options.headers={}]
   * Extra XHR headers to stamp the request with.
   *
   * @param {Function} [options.mutator=null]
   * A function to be called prior to initiating the request.
   */
  jQuery.CORS = function(options) {
    options = options || {};

    var mutator = options.mutator;

    if (mutator) {
      delete options.mutator;
      CORSOptions.mutators.push(mutator);
    }

    _.merge(CORSOptions, options);

    if (!CORSInstalled) {
      $.ajaxCORS = ajaxCORS;
      CORSInstalled = true;
    }

    return CORSOptions;
  };

  return $;
});