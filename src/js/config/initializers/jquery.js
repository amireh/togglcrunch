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
    timeout:  Config.xhr.timeout
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

  return $;
});