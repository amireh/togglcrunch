define([ 'ext/backbone', 'ext/jquery', 'when' ],
function(Backbone, $, when) {
  var ACCESS_OK = 0;
  var ACCESS_UNAUTHORIZED = 1;
  var ACCESS_OVERAUTHORIZED = 2;

  /**
   * @class Pibi.Core.Router
   * @extends Backbone.Router
   * @singleton
   *
   * Application router. Intercepts all "local" links and routes them through
   * to Backbone.History.
   *
   * @alternateClassName Router
   */
  var ApplicationRouter = Backbone.Router.extend({
    id: 'ApplicationRouter',

    options: {
      pushState: false,
      localized: true
    },

    module: 'applicationRouter',

    requires: [ 'user', 'state' ],
    routes: {},

    /**
     * @property {String} currentRoute
     * The currently *active* route.
     */
    currentRoute: null,

    previousRoute: null,

    /**
     * @property {String} initialRoute
     * The route the application was booted in.
     */
    initialRoute: null,

    /**
     * @private
     */
    history: Backbone.history,

    constructor: function() {
      Backbone.Router.apply(this, arguments);

      var that = this;
      var consume = $.consume;
      var routeLinks = _.bind(function(e) {
        var consumed = consume(e);

        // this.redirectTo($(this).attr('href'));
        this.redirectTo($(e.currentTarget).attr('href'));

        return consumed;
      }, this);

      // Route all non-external links
      $(document).on('click', 'a[href^="/"][target!=_blank]', routeLinks);

      var redirectToLogin = _.bind(function() {
        this.redirectTo('/login');
      }, this);

      var redirectBack = _.bind(this.back, this);

      // Intercept the matched route handler so that we can test if the
      // requested route is protected and if it is, we will redirect to the
      // authentication endpoint, otherwise we let it pass normally.
      this.history.loadUrl = function(fragmentOverride) {
        var fragment = this.fragment = this.getFragment(fragmentOverride);
        var accessRc;
        var handler = _.find(this.handlers, function(handler) {
          return handler.route.test(fragment);
        });

        if (!handler) {
          return false;
        }

        accessRc = that._validateAccess(handler.router, fragment);

        switch(accessRc) {
          case ACCESS_UNAUTHORIZED:
            that.trigger('route:unauthorized', fragment);
            redirectToLogin();
          break;
          case ACCESS_OVERAUTHORIZED:
            that.trigger('route:overauthorized', fragment);
            redirectBack();
          break;
          default:
            handler.callback(fragment);
        }

        return true;
      };

      return this;
    },

    /**
     * Starts the routing and controlling engines.
     *
     * @param {Boolean} [preload=false]
     *        When true, the router will automatically fire the current route
     *        once the engine has been started.
     */
    start: function(preload) {
      var root = '/';

      if (this.options.localized) {
        root += this._getLocale();
      }

      // Start the backbone routing engine
      this.history.start({
        pushState: this.options.pushState,
        root: root,
        silent: !preload
      });

      this.initialRoute = this.currentRoute = this.normalize(this.history.fragment);
    },

    /**
     * Stop the routing engine. Visiting local links will no longer do anything.
     */
    stop: function() {
      this.history.stop();
    },

    /**
     * Go back.
     *
     * @see #previousRoute
     */
    back: function() {
      var destination = this.previousRoute || '/';

      console.debug('Back to:', destination);

      return this.redirectTo(destination, false);
    },

    /**
     * Transition to the specified endpoint.
     *
     * On successful routing, Router#currentRoute will be updated.
     *
     * @param  {String} uri
     * Endpoint to transition to. Leading slash is insignificant.
     *
     * @param  {Boolean} [noReload=false]
     * Do not re-transition into the endpoint if it is the current one.
     */
    redirectTo: function(uri, noReload) {
      var currentUri;

      uri = this.normalize(uri);
      currentUri = this.normalize( this.history.fragment );

      if (!noReload) {
        this.history.fragment = '__redirection__';
      }
      // Same endpoint?
      else if (currentUri === uri) {
        return this;
      }

      console.debug('Redirecting ['+currentUri+'] => ['+uri+']');

      this.previousRoute = currentUri;
      this.currentRoute = uri;

      console.debug('Current route:', this.currentRoute);

      return this.history.navigate(uri, {
        silent: false,
        trigger: true
      });
    },

    redirectToDefault: function() {
      return this.redirectTo('/');
    },

    dump: function() {
      return {
        visitedRoutes: this.history.routeHistory
      };
    },

    /**
     * Normalize a route by adding a leading slash if necessary.
     * @private
     */
    normalize: function(inURI) {
      var uri = String(inURI || '');

      if (uri[0] !== '/') {
        uri = '/' + uri;
      }

      return uri;
    },

    /**
     * @private
     */
    _getLocale: function() {
      return window.locale || '';
    },

    /**
     * @private
     *
     * @return {Boolean} Whether the user is running an authentic session.
     */
    isAuthorized: function() {
      return !!this.user.get('id');
    },

    /**
     * @private
     *
     * Redirect to /login if the endpoint is marked as protected by the router
     * and the user is not authenticated.
     *
     * @param  {Backbone.Router} router
     *         The router that is responsible for handling the endpoint.
     *
     * @param  {String} fragment
     *         The relative URI.
     *
     * @return {Integer}
     *         0 if the user has access, 1 if they need to login,
     *         2 if the need to logout.
     */
    _validateAccess: function(router, fragment) {
      if (!router) {
        throw new TypeError('Expected endpoint handler to contain a router.');
      }

      if (!this.isAuthorized() && this._matches(fragment, router.protected)) {
        console.warn('Access to protected endpoint denied:', fragment);

        return ACCESS_UNAUTHORIZED;
      }
      else if (this.isAuthorized() && this._matches(fragment, router.public)) {
        console.warn('Access to public endpoint denied:', fragment);

        return ACCESS_OVERAUTHORIZED;
      }

      return ACCESS_OK;
    },

    /**
     * Test if a given URI is restricted from public access.
     *
     * @param {String} uri
     *        The fully-qualified URI to test.
     *
     * @return {Boolean}
     *         True if the given URI is protected from anonymous access.
     */
    _matches: function(uri, filters) {
      var i;
      var filter;
      var nrFilters;

      filters = filters || [];
      nrFilters = filters.length;
      uri = String(uri || '');

      for (i = 0; i < nrFilters; ++i) {
        filter = filters[i];

        if (uri.match(filter)) {
          return true;
        }
      }

      return false;
    },

  });

  return new ApplicationRouter;
});