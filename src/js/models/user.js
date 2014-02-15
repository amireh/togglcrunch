define([
  'ext/lodash',
  'ext/backbone',
  'collections/time_entries'
], function(_, Backbone, TimeEntries) {

  var User = Backbone.Model.extend({
    module: 'user',

    clients: new Backbone.Collection(),
    workspaces: new Backbone.Collection({ model: Backbone.Model }),
    timeEntries: new TimeEntries,

    initialize: function() {
      this.on('change:workspaces', function() {
        this.workspaces.reset(this.get('workspaces'));
      }, this);

      this.on('change:time_entries', function() {
        this.timeEntries.reset(this.get('time_entries'));
        // this.timeEntries.trigger('sync', this.timeEntries);
      }, this);
    },

    clear: function() {
      _([ 'clients', 'workspaces', 'timeEntries' ]).each(function(resource) {
        this[resource].clear();
      }, this);

      return Backbone.Model.prototype.clear.apply(this, arguments);
    }
  });

  return new User;
});