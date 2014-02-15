define([
  'ext/lodash',
  'ext/backbone'
], function(_, Backbone) {

  var State = Backbone.Model.extend({
    module: 'state',
    requires: [ 'user' ]
  });

  Object.defineProperty(State.prototype, 'date', {
    get: function() {
      return this.get('date') || moment.utc();
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