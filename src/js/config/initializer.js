define([
  'config/initializers/i18next',
  'config/initializers/jquery',
  'config/initializers/pikaday',
  'config/initializers/moment',
  'config/initializers/backbone',
  'ext/lodash',
  'ext/handlebars',
  'ext/jquery',
  'core/viewport',
  'core/controller',
  'models/state',
  'models/user',
  'bootstrap'
  //>>excludeStart("production", pragmas.production);
  , 'config/initializers/debug'
  //>>excludeEnd("production");
],
function(loadLocale) {
  return loadLocale;
});