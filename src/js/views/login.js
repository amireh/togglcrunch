define([ 'view', 'hbs!login'], function(View, Template) {
  'use strict';

  return View.extend({
    name: 'LoginView',
    template: Template,
    requires: [ 'state', 'user', 'applicationRouter' ],
    container: '#main',

    events: {
      'submit': 'onLogin'
    },

    onLogin: function(e) {
      var apiToken = this.$('[name="apiToken"]').val();
      var that = this;

      this.state.set('apiToken', apiToken);

      // that.statusbar.set('Logging in... please wait.');

      $.consume(e);

      this.user.fetch().then(function(data) {
        that.state.save();
        that.applicationRouter.redirectTo('/');
      });
    }
  });
});