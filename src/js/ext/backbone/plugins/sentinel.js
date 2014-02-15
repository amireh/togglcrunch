/* global Backbone: false */
define([ 'ext/backbone/plugin' ], function(Plugin) {

  /**
   * @class Backbone.Plugin.Sentinel
   * @extends Backbone.Plugin
   *
   * A low-level plugin that "watches" Backbone entities being created and
   * triggers events to interested parties to handle.
   *
   * Creation events are triggered on the global Backbone object.
   *
   * Example: listening to creation of any model
   *
   *     Backbone.on('model:created', function(model) {
   *       doThingsToModel(model);
   *     });
   *
   * The entities watched by the Sentinel can be customized by overriding
   * the #targets property.
   *
   * ---
   *
   * **This plugin integrates with the following Backbone plugins:**
   *
   * - Backbone.Plugin.DeepModels - fires event 'model:created'
   *
   */
  return Plugin.extend({
    name:  'Sentinel',
    version:    '0.1.0',
    bbVersion:  '1.0.0',
    sisters:    [ 'DeepModels' ],

    /**
     * @cfg {String[]} [targets=['Model', 'Collection', 'View']]
     * The Backbone entities that will be watched by the Sentinel.
     *
     * In order to watch more entities, you can push to this array with the name
     * of the entity that *must* be locatable in the global Backbone namespace.
     */
    targets: [ 'Model', 'Collection', 'View', 'Router' ],
    mapping: {},

    setup: function(options) {
      options = options || {};

      // Look for the Backbone.DeepModel plugin - if it's installed, we must
      // wrap it before anyone else extends it!
      //
      // This is why we can't wait to do this at the plugin sisterhood setup stage.
      if (Backbone.DeepModel) {
        this.log('DeepModel Backbone plugin found: ',
          'will be watching DeepModel objects.');

        this.mapping['DeepModel'] = 'model';
        this.targets.push('DeepModel');
      }

      // Install the wrapping code for each target.
      _.each(this.targets, this.__wrapTarget, this);

      this.log('Watching resources:', this.targets.join(', '));
    },

    cleanup: function() {
      _.each(this.targets, this.__restoreTarget, this);
    },

    eventFor: function(target, event) {
      if (this.mapping[target]) {
        target = this.mapping[target];
      }

      return [ target, event || 'created' ].join(':').toLowerCase();
    },

    /**
     * @private
     *
     * Wrap the constructor and hack into the prototype to enable caching.
     *
     * @note
     * This is NOT an opt-in feature, all Collection objects will be extended
     * with the Sentinelable interface!
     *
     * See #isSentinelable.
     */
    __wrapTarget: function(target) {
      var ORIGINAL = Backbone[target];
      var CTOR = ORIGINAL;
      var PROTOTYPE = ORIGINAL.prototype;
      var EXTEND = ORIGINAL.extend;

      var evtCreating = this.eventFor(target, 'creating');
      var evtCreated = this.eventFor(target, 'created');

      Backbone[target] = function() {
        Backbone.trigger(evtCreating, this);

        // Invoke the original constructor, and keep a reference to its output.
        var out = CTOR.apply(this, arguments);

        Backbone.trigger(evtCreated, this);

        // We *are* transparent, after all.
        return out;
      };

      // Attach the original prototype to the wrapped constructor
      Backbone[target].prototype = PROTOTYPE;

      // Need to restore #extend in the ctor itself and not the prototype.
      Backbone[target].extend = EXTEND;

      // this.log(target, 'instances will be triggering', evtCreated, 'when spawned.');
    },

    __restoreTarget: function(target) {
      var ORIGINAL  = Backbone[target];
      Backbone[target] = ORIGINAL;
    }
  });
});