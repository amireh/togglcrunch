/**
 * @class  Backbone
 *
 * Pibi.js Backbone extensions, hacks, and overrides.
 */
define([
  'lodash',
  'backbone',
  'ext/backbone/view',
  'ext/backbone/history',
  'ext/backbone/router',
  'ext/backbone/controller',
  'ext/backbone/plugin_manager',
  'ext/backbone/plugins/sentinel',
  'ext/backbone/plugins/registry',
  'ext/backbone/plugins/controllers'
],
function(
  _,
  Backbone,
  ViewExtensions,
  HistoryExtensions,
  RouterExtensions,
  Controller,
  PluginManager,
  SentinelPlugin,
  RegistryPlugin,
  ControllersPlugin) {

  // Install the Backbone plugins we'll be using.
  Backbone.PluginManager = new PluginManager();
  Backbone.PluginManager.install(new SentinelPlugin());
  Backbone.PluginManager.install(new RegistryPlugin());
  Backbone.PluginManager.install(new ControllersPlugin());

  return Backbone;
});