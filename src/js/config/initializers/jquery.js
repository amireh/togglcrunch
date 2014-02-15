/**
 * jQuery initializer.
 */
define([
  'ext/jquery',
  'config'
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

  $(document).ajaxSend(function(event, xhr, settings) {
    xhr.setRequestHeader('Authorization',
      'Basic ' + btoa(App.apiToken + ':api_token'));
  });

  // Disable disabled links!
  $(document.body).on('click', '.disabled, :disabled', $.consume);

  return $;
});