/**
 * Backbone initializer.
 */
define([
  'ext/backbone',
  'ext/jquery/CORS',
  'when'
], function(Backbone, $, when) {
  'use strict';

  // Use the CORS version of ajax
  Backbone.ajax = function() {
    return when($.ajaxCORS.apply($, arguments));
  };
});