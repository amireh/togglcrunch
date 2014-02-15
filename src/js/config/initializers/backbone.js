/**
 * Backbone initializer.
 */
define([
  'ext/backbone',
  'ext/jquery/CORS',
  'store',
  'when'
], function(Backbone, $, Store, when) {
  'use strict';

  // Install Cache storage adapter
  Backbone.Cache.setAdapter(Store);
  Backbone.Cache.setAvailable(Store.enabled);

  // Use the CORS version of ajax
  Backbone.ajax = function() {
    return when($.ajaxCORS.apply($, arguments));
  };
});