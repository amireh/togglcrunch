/* global Backbone: false */
define([ 'ext/backbone/plugin' ], function(Plugin) {
  /**
   * @class Backbone.Plugin.Registry
   * @extends Backbone.Plugin
   *
   * A centralized repository for managing Backbone entities arbitrarily
   * and setting up explicit relationships between them.
   *
   * Entities (like Models, Collections, and Views) are added to the repository
   * as soon as they are created, and from then on, external code can hook into
   * the repository to manage them.
   *
   * Glossary:
   *
   *   - Entity: an object that will be used as either a module or a dependant
   *   of a module. Entities can be anything really, not tied to Backbone
   *   entities, however, Module entities must define a listener interface.
   *   - Module: a *singleton* entity that can emit events, and has other
   *   entities that depend on it
   */
  return Plugin.extend({
    name: 'Registry',
    dependencies: [ 'Sentinel' ],

    targets: [ 'model', 'collection', 'view', 'router' ],

    options: {
      verbose: false
    },

    setup: function() {
      if (!Backbone.Sentinel) {
        throw 'Backbone.Registry: Sentinel plugin must be initialized first.';
      }

      this.modules = {};

      _.each(this.targets, function(target) {
        this.sniff(target);
      }, this);
    },

    sniff: function(target) {
      this.listenTo(Backbone, target + ':created', this.checkObject);
    },

    cleanup: function() {
      this.stopListening(Backbone);
      this.reset();
    },

    /**
     * Register a given (singleton) entity as a Module that tracks dependencies.
     *
     *     Declaration format:
     *     {
     *       "module": "uniqueModuleName"
     *     }
     *
     * @param  {String} moduleId
     *         The module's id.
     *
     * @param  {Mixed} entity
     *         The entity to be registered as a module.
     */
    registerModule: function(moduleId, module) {
      var entry;

      entry = this.moduleEntry(moduleId);
      entry.module = module;

      this.resolve(entry);
    },

    /**
     * Specify a dependency between two modules. The dependant will be assigned
     * with a reference to the requested module once that module has been
     * registered.
     *
     * Dependencies are defined in a special `requires` key.
     *
     *     @example
     *
     *     var User = Backbone.Model.extend({
     *       module: 'user'
     *     });
     *
     *     var Creature = Backbone.Model.extend({
     *       requires: [ 'user', 'controller' ],
     *
     *       initialize: function() {
     *         this.user; // => User
     *         this.controller; // => Controller
     *       }
     *     });
     *
     * In the example above, Creature objects will be defined as dependants on
     * the user and controller singleton modules.
     *
     * @param {String} moduleId A unique module id.
     * @param {Object} entity The dependant object.
     *
     * @throws {Error}
     *         If the dependant has a defined attribute named as the
     *         moduleId but doesn't resolve to the module entity.
     */
    addDependency: function(moduleId, dependant) {
      var entry;
      var module;

      entry = this.moduleEntry(moduleId);

      // Track the dependant
      entry.dependants.push(dependant);

      // Expose the module to the dependant:
      //
      // The dependant can now do things like:
      //
      //     this.user.doThings()
      //
      module = entry.module;

      if (module) {
        this.resolve(entry);
      }
    },

    /**
     * Resolve the dependencies in a given module entry by assigning a reference
     * to the module in each dependant.
     *
     * The module will be notified of each dependant in #onDependency if it
     * implements the method.
     *
     * Finally, the resolved dependency will be un-tracked to free references so
     * the GC can clean up properly.
     *
     * @private
     */
    resolve: function(entry) {
      var moduleId = entry.id;
      var module = entry.module;
      var wantsCallback;
      var resolved = [];
      var registrationCallback = this.mkModuleId('init with ' + moduleId);
      var that = this;

      if (_.isEmpty(entry.dependants)) {
        return [];
      }

      wantsCallback = _.isFunction(module.onDependency);

      _.each(entry.dependants, function(dependant) {
        if (dependant[moduleId] && dependant[moduleId] != module) {
          throw moduleId + ' is already assigned in ' + dependant;
        }

        Object.defineProperty(dependant, moduleId, {
          get: function() {
            return that.modules[moduleId].module;
          }
        });

        if (dependant[registrationCallback]) {
          dependant[registrationCallback](module);
        }

        if (wantsCallback) {
          module.onDependency(dependant);
        }

        resolved.push(dependant.toString());
      });

      // Untrack them
      entry.dependants = [];

      return resolved;
    },

    log: function() {
      if (!this.options.verbose) {
        return;
      }

      return Plugin.prototype.log.apply(this, arguments);
    },

    /**
     * Parse module or dependencies declarations in a given resource.
     *
     * If the object contains a `module` key, then it will be registered as a
     * module.
     *
     * If the object contains a `dependencies` array, then each module in that
     * array will be tracking this resource as a dependant.
     *
     * @private
     *
     * @param  {Object} resource The object to test.
     */
    checkObject: function(resource) {
      if (resource.module) {
        this.registerModule(resource.module, resource);
      }

      if (_.isArray(resource.requires)) {
        _.each(resource.requires, function(moduleId) {
          this.addDependency(moduleId, resource);
        }, this);
      }
    },

    /**
     * Create (or retrieve) a entry entry for a given module. These entries
     * keep track of the module object, its id, status, dependencies,
     * and callbacks.
     *
     * @private
     *
     * @param  {String} id
     *         A unique module id.
     * @param  {Object} module
     *         The module object.
     *
     * @return {Object} The module entry.
     */
    moduleEntry: function(moduleId) {
      var entry;

      if (!this.modules) {
        throw 'Backbone.Registry: Sentinel plugin must be initialized first.';
      }

      moduleId = this.mkModuleId(moduleId);
      entry = this.modules[moduleId];

      if (!entry) {
        entry = this.modules[moduleId] = {
          id: moduleId,
          module: null,
          dependants: []
        };
      }

      return entry;
    },

    mkModuleId: function(id) {
      if (!_.isString(id)) {
        throw "Bad module declaration '" +
          JSON.stringify(id) +
          "' (expected a String)";
      }

      return (id || '').
        replace(/\s/g, '_').
        replace(/_+/g, '_').
        underscore().
        camelize(true);
    },

    reset: function() {
      this.modules = {};
    },

    unregister: function(moduleId) {
      delete this.modules[this.mkModuleId(moduleId)];
    }
  });
});