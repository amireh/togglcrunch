define([ 'view', 'hbs!workspaces' ], function(View, Template) {
  'use strict';

  return View.extend({
    name: 'WorkspacesView',
    template: Template,
    requires: [ 'user', 'state' ],

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
          console.debug('loading done!');
          that.setTimeEntries(that.buffer, data);
          that.buffer = [];
          that.poolSz = that.bufferSz = 0;
          return data;
        });

        // Statusbar updates
        this.loading.promise.then(null, null, function() {
          console.debug('loading: ticking...');
          App.statusbar.tick(that.bufferSz / that.poolSz * 100);
        });

        this.loading.promise.catch(DEBUG.onError);
      }

      this.current = this.state.activeWorkspace;

      if (!this.current) {
        App.statusbar
          .set(i18n.t('status.must_choose_workspace', 'You must choose a workspace first!'));

        return;
      }

      App.statusbar
        .set(i18n.t('status.loading_time_entries', 'Loading time entries...'))
        .tick('100');

      $.ajaxCORS({
        url: 'details',
        data: {
          page: page,
          workspace_id: this.current.id,
          since: this.state.dateRange.start.format('L'),
          until: this.state.dateRange.end.format('L')
        }
      }).then(function(data) {
        var cursor = page * data.per_page;

        that.buffer = _.union(that.buffer, data.data);
        that.poolSz = data.total_count;
        that.bufferSz = that.buffer.length;

        if (data.total_count > cursor) {
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
        App.statusbar.set('Unable to load data.');
        DEBUG.onError(error);
        return error;
      });

      return this.loading.promise;
    },

    setTimeEntries: function(entries, stats) {
      this.debug('setting time entries:', entries);
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