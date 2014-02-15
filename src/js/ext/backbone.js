/**
 * @class  Backbone
 *
 * Pibi.js Backbone extensions, hacks, and overrides.
 */
define([
  'lodash',
  'backbone',
  'ext/backbone/model',
  'ext/backbone/collection',
  'ext/backbone/view',
  'ext/backbone/history',
  'ext/backbone/plugin_manager',
  'ext/backbone/plugins/deep_model',
  'ext/backbone/plugins/sentinel',
  'ext/backbone/plugins/registry',
  'ext/backbone/plugins/cache',
  'ext/backbone/plugins/inherits',
  'ext/backbone/plugins/logger'
],
function(
  _,
  Backbone,
  ModelExtensions,
  ViewExtensions,
  CollectionExtensions,
  HistoryExtensions,
  PluginManager,
  DeepModelPlugin,
  SentinelPlugin,
  RegistryPlugin,
  CachePlugin,
  InheritsPlugin,
  LoggerPlugin) {

  CachePlugin.prototype.options = {
    events: {
      Collection: {
        purgeOn: null
      }
    }
  };

  // Install the Backbone plugins we'll be using.
  Backbone.PluginManager = new PluginManager();
  Backbone.PluginManager.install(new LoggerPlugin());
  Backbone.PluginManager.install(new DeepModelPlugin());
  Backbone.PluginManager.install(new SentinelPlugin());
  Backbone.PluginManager.install(new InheritsPlugin());
  Backbone.PluginManager.install(new RegistryPlugin());
  Backbone.PluginManager.install(new CachePlugin());

  return Backbone;
});