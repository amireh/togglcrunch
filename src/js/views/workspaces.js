define([ 'view', 'hbs!workspaces' ], function(View, Template) {
  'use strict';

  return View.extend({
    name: 'WorkspacesView',
    template: Template,
    requires: [ 'user', 'state', 'statusbar', 'applicationRouter' ],

    events: {
      'change': 'gotoWorkspace'
    },

    buffer: [],

    templateData: function() {
      return {
        workspaces: this.user.workspaces.toJSON()
      }
    },

    mount: function() {
      this.listenTo(this.user, 'change:workspaces', this.reload);
      this.listenTo(this.state, 'change:date', this.onLoadTimeEntries);
      this.listenTo(this.state, 'change:activeWorkspace', this.onLoadTimeEntries);

      this.loadTimeEntries();
    },

    gotoWorkspace: function() {
      var workspaceId = parseInt(this.$(':selected').val(), 10);
      var workspace = this.user.workspaces.get(workspaceId);
      var workspaceUrl;

      if (!workspace) {
        return;
      }

      workspaceUrl = '/workspaces/' + workspaceId;
      this.applicationRouter.redirectTo(workspaceUrl);
    },

    onLoadTimeEntries: function() {
      this.loadTimeEntries();
    },

    loadTimeEntries: function(page) {
      page = page || 1;

      var that = this;
      var anchor = this.state.date;
      window.view = this;

      if (!this.loading) {
        this.loading = when.defer();
        this.loading.promise.then(function(data) {
          that.setTimeEntries(that.buffer, data);
          that.buffer = [];
          that.poolSz = that.bufferSz = 0;
          that.state.trigger('loaded:timeEntries');
          that.statusbar.set(i18n.t('status.ready', 'Ready.')).tick(0);

          return data;
        });

        // Statusbar updates
        this.loading.promise.then(null, null, function() {
          that.statusbar.tick(that.bufferSz / that.poolSz * 100);
        });

        this.loading.promise.catch(DEBUG.onError);
      }

      this.current = this.state.activeWorkspace;

      if (!this.current) {
        this.statusbar
          .set(i18n.t('status.must_choose_workspace',
            'You must choose a workspace first!'));

        return;
      }

      this.statusbar
        .set(i18n.t('status.loading_time_entries', 'Loading time entries...'))
        .tick('0');

      this.state.trigger('loading:timeEntries');

      $.ajaxCORS({
        url: 'details',
        data: {
          page: page,
          workspace_id: this.current.id,
          since: this.state.dateRange.start.format('L'),
          until: this.state.dateRange.end.format('L')
        }
      }).then(function(data) {
        if (!that.loading) { // loading was cancelled or re-run
          return;
        }

        var cursor = page * data.per_page;

        that.buffer = _.union(that.buffer, data.data);
        that.poolSz = data.total_count;
        that.bufferSz = that.buffer.length;

        that.loading.notify();

        if (data.total_count != 0 && data.total_count > cursor) {
          // need to load next page
          console.warn('need to paginate');
          that.loadTimeEntries(page+1);
        }
        else {
          that.loading.resolve(data);
          that.loading = null;
        }

        return that.loading;
      })
      .otherwise(function(error) {
        that.statusbar.set('Unable to load data.');
        DEBUG.onError(error);
        return error;
      });

      return this.loading.promise;
    },

    setTimeEntries: function(entries, stats) {
      console.debug('setting time entries:', entries, stats);
      this.user.set('time_entries', [], { silent: true });
      this.user.set('time_entries', entries);
      this.user.set('time_entry_stats', {
        total_count: stats.total_count,
        total_billable: stats.total_billable,
        total_grand: stats.total_grand
      });
    }
  });
});