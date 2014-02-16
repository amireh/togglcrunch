define([ 'ext/lodash', 'ext/backbone', 'when' ], function(_, Backbone, when) {
  'use strict';

  /**
   * Assert a given view factory is renderable. This tests the following:
   *
   *  - view's prototype is actually a Backbone.View
   *  - view responds to #render
   *  - view responds to #remove
   */
  function assertRenderable(view) {
    if (!view || !(view.prototype instanceof Backbone.View)) {
      console.debug('Unexpected view:', view);

      throw new TypeError('View must be an instance of Backbone.View');
    }
    else if (!_.isFunction(view.prototype.render)) {
      throw new TypeError('View must respond to #render.');
    }
    else if (!_.isFunction(view.prototype.remove)) {
      throw new TypeError('View must respond to #remove.');
    }

    return true;
  }

  function hideLoadingScreen(ms) {
    return $('#loading_screen')
      .animate({ 'opacity': 'hide' }, ms)
      .promise()
        .done(function() {
          $('body').removeClass('state-loading');
        });
  }

  /**
   * @private
   * @property {Backbone.View}
   * So this is the view currently occupying the viewport.
   */
  var currentView = null;
  var currentViewFactory = null;

  /**
   * @private
   * @property {String}
   * This is the URI at which the currentView became visible.
   */
  var currentRoute = null;

  var currentLayout = null;

  /**
   * @class Pibi.Core.Viewport
   * @extends Backbone.View
   * @singleton
   *
   * The viewport represents one primary view the user is focusing on at a time.
   * It manages transitioning between the views.
   */
  var Viewport = Backbone.View.extend({
    name: 'Viewport',
    el: '#content',

    module: 'viewport',

    options: {
      /**
       * @cfg {Number} Milliseconds to wait before hiding the loading screen.
       */
      loadingScreenTimer: 500
    },

    /**
     * Prepare the viewport for attaching views.
     *
     * Hide the loading screen.
     *
     * @return {when} A promise of the viewport being ready.
     */
    start: function() {
      console.debug('Starting...');
      return when(hideLoadingScreen(this.options.animationTimer));
    },

    /**
     * Attach a primary view to display, and detach the current one if needed.
     *
     * @param  {Backbone.View} view
     *         The primary view to display.
     *
     * @param  {Object} options
     *         View rendering options to pass to Backbone.View#render
     *
     * @return {when}
     *         A promise of the view being loaded, rendered, and attached.
     */
    attach: function(viewFactory, options) {
      var that = this;

      console.debug('Requested to attach view:' + viewFactory.prototype.name);

      assertRenderable(viewFactory);

      if (currentView) {
        if (currentView instanceof viewFactory) {
          console.debug('View is already attached: ' + currentView);

          return when(currentView);
        }

        console.debug('detaching ' + currentView);

        return this.clear().then(function() {
          console.debug('detached, now attaching ' + viewFactory.prototype.name);
          return that.attach(viewFactory, options);
        }).otherwise(function(error) {
          that.error('unable to detach!', error);
          return error;
        });
      }

      currentViewFactory = viewFactory;
      currentView = new viewFactory();
      currentRoute = Backbone.history.fragment;

      return this.attachView(currentView, options).then(function() {
        return currentView;
      });
    },

    attachView: function(view, options) {
      var that = this;

      this.trigger('attaching', view);

      return view._render(options).then(function() {
        console.debug('Attaching view:', view.toString());
        that.$el.append(view.$el);

        that.trigger('attached', view);
        // that._status = null;

        return view;
      }).otherwise(function(error) {
        that.error('Unable to attach view:', error);
        that.trigger('error', {
          context: 'attaching_view',
          error: error
        });

        return error;
      });
    },

    setLayout: function(layout) {
      var that = this;

      if (currentLayout) {
        if (layout === currentLayout) {
          console.warn('Rejecting request to set layout; it is already set.');
          return when();
        }

        console.warn('Rejecting request to set layout; must remove current layout first.');

        return currentLayout._remove().done(function() {
          currentLayout = null;
          that.setLayout(layout);
        });
      }

      currentLayout = layout;

      that.warn('Attaching layout: ', layout.name);

      return currentLayout._render().done(function() {
        that.warn('Layout attached:' + currentLayout);
        return true;
      });
    },

    /**
     * Reset the viewport by removing the primary view.
     * @private
     */
    clear: function() {
      if (!this.isOccupied()) {
        throw new ContextError('Viewport has no visible view to detach.', this);
      }

      return currentView._remove().ensure(function(rc) {
        currentView = currentRoute = null;
        return rc;
      });
    },

    /**
     * @return {Boolean}
     * Whether a primary view is currently occupying the viewport.
     */
    isOccupied: function() {
      return !!currentView;
    },

    currentView: function() {
      return currentView;
    },

    currentRoute: function() {
      return currentRoute;
    },

    currentLayout: function() {
      return currentLayout;
    },

    reload: function(options) {
      if (currentView) {
        var that = this;
        var viewPrototype = window.viewProto = currentViewFactory;

        return this.clear().then(function() {
          that.info('Reloading:', viewPrototype.prototype.name);
          return that.attach(viewPrototype, options);
        });
      }

      return when(true);
    }
  });

  return new Viewport();
});