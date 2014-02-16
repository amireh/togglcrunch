define([
  'view',
  'hbs!application',
  'views/milestones',
  'views/workspaces',
  'views/datepicker'
], function(View,
  Template,
  MilestonesView,
  WorkspacesView,
  DatepickerView) {
  'use strict';

  return View.extend({
    container: '#main',
    template: Template,
    children: [
      DatepickerView,
      WorkspacesView,
      MilestonesView
    ],

    events: {
      'submit form': 'refreshApiToken'
    },

    requires: [ 'user', 'state', 'applicationRouter' ],

    mount: function() {
      this.$('.dropdown').dropdown();
      this.listenTo(this.user, 'change:workspaces', this.toggleEnabled);
      this.listenTo(this.state, 'change:activeWorkspace', this.toggleEnabled);
      this.toggleEnabled();
    },

    templateData: function() {
      return {
        user: this.user.toJSON(),
        date: this.state.date.format('LL')
      }
    },

    changeDate: function() {
      this.state.set('date', this.picker.getMoment());
    },

    onLogout: function() {
      this.user.clear();
      this.applicationRouter.redirectTo('/');
    },

    onReload: function() {
      this.state.trigger('change:activeWorkspace');
    },

    toggleEnabled: function() {
      var hasWorkspace = !!this.state.activeWorkspace;

      this.$('#content').toggleEnabled(hasWorkspace);
      this.$('#workspaceRequiredAlert').toggle(!hasWorkspace);
    }
  });
});