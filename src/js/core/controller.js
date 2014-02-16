define([
  'ext/jquery',
  'ext/backbone',
  'core/viewport',
  'views/application',
  'views/login'
], function($, Backbone, Viewport, ApplicationView, LoginView) {

  var Controller = Backbone.Controller.extend({
    /**
     * @property {String[]} routes
     *
     * Available routes.
     */
    routes: {
      '': 'landing',
      'login': 'login',
      'logout': 'logout',
      'workspaces/:workspace_id': 'activateWorkspace'
    },

    requires: [ 'state', 'user', 'applicationRouter', 'viewport' ],

    protected: [ 'workspaces' ],
    public: [ 'login' ],

    initWithState: function(state) {
      console.debug('installing authorization header');

      $(document).ajaxSend(function(event, xhr, settings) {
        xhr.setRequestHeader(
          'Authorization',
          'Basic ' + btoa(state.get('apiToken') + ':api_token'));
      });
    },

    landing: function() {
      if (!this.applicationRouter.isAuthorized()) {
        return this.applicationRouter.redirectTo('/login');
      }

      console.debug('logged in, proceeding to app')

      Viewport.attach(ApplicationView);
    },

    login: function() {
      Viewport.attach(LoginView);
    },

    logout: function() {
      this.user.clear();
      this.state.clear().save();
      this.applicationRouter.redirectTo('/');
    },

    activateWorkspace: function(workspaceId) {
      this.state.set('activeWorkspace', workspaceId);
      this.render(ApplicationView);
    }
  });

  return new Controller;
});