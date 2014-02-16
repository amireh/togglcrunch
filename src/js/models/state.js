define([
  'ext/lodash',
  'ext/backbone',
  'store',
  'when'
], function(_, Backbone, Storage, when) {

  var State = Backbone.Model.extend({
    module: 'state',
    requires: [ 'user' ],

    defaults: {
      milestones: {
        monthly: 160,
        weekly: 40,
        daily: 8
      }
    },

    save: function(data) {
      this.set(data);

      Storage.set('state', this.toJSON());
      return when.defer().resolve();
    },

    fetch: function() {
      this.set(Storage.get('state'));
      return when.defer().resolve();
    },

    clear: function() {
      Backbone.Model.prototype.clear.apply(this, arguments);
      this.set(this.defaults, { silent: true });
      return this;
    }
  });

  Object.defineProperty(State.prototype, 'date', {
    get: function() {
      return moment.utc(this.get('date') || moment.utc());
    },

    set: function(value) {
      return this.set('date', value);
    }
  });

  Object.defineProperty(State.prototype, 'dateRange', {
    get: function() {
      var anchor = this.date;

      return moment.utc().range(
        anchor.clone().startOf('month'),
        anchor.clone().endOf('month'));
    }
  });

  Object.defineProperty(State.prototype, 'activeWorkspace', {
    get: function() {
      return this.user.workspaces.get(this.get('activeWorkspace'));
    }
  });

  return new State;
});