define([
  'ext/lodash',
  'ext/backbone',
  'collections/time_entries'
], function(_, Backbone, TimeEntries) {

  var User = Backbone.Model.extend({
    module: 'user',

    clients: new Backbone.Collection,
    workspaces: new Backbone.Collection,
    timeEntries: new TimeEntries,

    initialize: function() {
      this.on('change:clients', function() {
        this.clients.reset(this.get('clients'));
      }, this);

      this.on('change:workspaces', function() {
        this.workspaces.reset(this.get('workspaces'));
      }, this);

      this.on('change:time_entries', function() {
        this.timeEntries.reset(this.get('time_entries'));
      }, this);
    },

    clear: function() {
      _.each([ 'clients', 'workspaces', 'timeEntries' ], function(resource) {
        this[resource].reset();
      }, this);

      return Backbone.Model.prototype.clear.apply(this, arguments);
    },

    fetch: function() {
      var that = this;

      return $.ajaxCORS({
        url: 'env'
      }).then(function(data) {
        that.set(data.user);
        that.set('name',
          _.findWhere(data.workspace.users, { id: data.user.id }).name);

        return data;
      });
    }
  });

  return new User;
});