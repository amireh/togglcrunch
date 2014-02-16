define([ 'view', 'hbs!login'], function(View, Template) {
  'use strict';

  return View.extend({
    name: 'LoginView',
    template: Template,
    requires: [ 'state', 'user', 'applicationRouter', 'statusbar'],
    container: '#main',

    events: {
      'submit': 'onLogin'
    },

    mount: function() {
      this.statusbar.set(i18n.t('status.login_prompt'));
    },

    onLogin: function(e) {
      var apiToken = this.$('[name="apiToken"]').val();
      var that = this;

      this.state.set('apiToken', apiToken);

      that.statusbar.set('Logging in... please wait.').showIndicator();

      $.consume(e);

      this.user.fetch().then(function(data) {
        that.state.save();
        that.statusbar.tick(0);
        that.applicationRouter.redirectTo('/');
      });
    }
  });
});