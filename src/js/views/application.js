define([
  'view',
  'hbs!application',
  'views/milestones',
  'views/statusbar',
  'views/workspaces',
  'views/datepicker'
], function(View,
  Template,
  MilestonesView,
  StatusbarView,
  WorkspacesView,
  DatepickerView) {
  'use strict';

  return View.extend({
    container: '#main',
    template: Template,
    children: [ WorkspacesView, MilestonesView, StatusbarView, DatepickerView ],
    events: {
      'submit form': 'refreshApiToken'
    },

    requires: [ 'user', 'state' ],

    mount: function() {
      this.statusbar = App.statusbar = _.findWhere(this._children, { name: 'Statusbar' });
    },

    templateData: function() {
      return {
        date: this.state.date.format('LL')
      }
    },

    changeDate: function() {
      this.state.set('date', this.picker.getMoment());
    },

    refreshApiToken: function(e) {
      var apiToken = this.$('[name="apiToken"]').val();
      var that = this;

      App.apiToken = apiToken;

      that.statusbar.set('Logging in... please wait.');

      $.consume(e);
      $.ajaxCORS({
        url: 'env'
      }).then(function(data) {
        that.statusbar.set(i18n.t('logged_in', 'Logged in.'));
        that.user.set(data.user);
        return data;
      })
      .otherwise(function(err) {
        DEBUG.onError(error);
        return err;
      });
    }
  });
});