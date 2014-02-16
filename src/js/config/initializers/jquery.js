/**
 * jQuery initializer.
 */
define([
  'ext/jquery',
  'config',
  'bootstrap'
], function($, Config) {
  'use strict';

  $.CORS({
    host:     Config.apiHost,
    timeout:  Config.xhr.timeout,
    mutator: function(options) {
      options.data = options.data || {};
      options.data.user_agent = 'toggl_stats';
    }
  });

  $.ajaxSetup({
    converters: {
      "text json": function (response) {
        response = $.trim(response);

        if (!response.length) {
          response = '{}';
        }

        return $.parseJSON(response);
      }
    }
  });

  // Disable disabled links!
  $(document.body).on('click', '.disabled, :disabled', $.consume);

  $(document.body).tooltip({
    selector: '[rel="tooltip"]',
    html: false
  });

  return $;
});