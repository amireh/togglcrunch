define([
  'config/initializers/i18next',
  'config/initializers/jquery',
  'config/initializers/pikaday',
  'ext/lodash',
  'ext/handlebars',
  'ext/jquery',
  //>>excludeStart("production", pragmas.production);
  , 'config/initializers/debug'
  //>>excludeEnd("production");
],
function(loadLocale) {
  return loadLocale;
});