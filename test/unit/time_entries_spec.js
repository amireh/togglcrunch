define([ 'collections/time_entries', 'json!fixtures/time_entries_one_month' ], function(TimeEntries, Data) {
  describe('TimeEntries', function() {
    describe('#weekEntries', function() {
      it('should filter by the first three weeks', function() {
        var collection = new TimeEntries();
        collection.reset([
          { id: 1, start: "2014-01-01T06:00:00+00:00" },
          { id: 2, start: "2014-01-02T06:00:00+00:00" },
          { id: 3, start: "2014-01-03T06:00:00+00:00" },
          { id: 4, start: "2014-01-04T06:00:00+00:00" },
          { id: 5, start: "2014-01-05T06:00:00+00:00" },
          { id: 6, start: "2014-01-06T06:00:00+00:00" },
          { id: 7, start: "2014-01-08T06:00:00+00:00" },
          { id: 8, start: "2014-01-09T06:00:00+00:00" },
          { id: 9, start: "2014-01-18T06:00:00+00:00" }
        ]);

        expect(collection.weekEntries(1, 0).length).toEqual(6);
        expect(collection.weekEntries(2, 0).length).toEqual(2);
        expect(collection.weekEntries(3, 0).length).toEqual(1);
        expect(collection.weekEntries(4, 0).length).toEqual(0);
      });

      it('should filter by the last week', function() {
        var collection = new TimeEntries();
        collection.reset([
          { id: 1, start: "2014-01-18T06:00:00+00:00" },
          { id: 2, start: "2014-01-24T06:00:00+00:00" },
          { id: 3, start: "2014-01-25T06:00:00+00:00" },
          { id: 4, start: "2014-01-31T06:00:00+00:00" }
        ]);

        expect(collection.weekEntries(3, 0).length).toEqual(1);
        expect(collection.weekEntries(4, 0).length).toEqual(3);
      });
    });

    describe('#dayEntries', function() {
      it('should filter by the first three weeks', function() {
        var collection = new TimeEntries();
        collection.reset([
          { id: 1, start: "2014-01-01T06:00:00+00:00" },
          { id: 2, start: "2014-01-04T06:00:00+00:00" },
          { id: 3, start: "2014-01-04T18:00:00+00:00" }
        ]);

        collection.state.date = moment([ 2014, 0, 1 ]);
        expect(collection.dayEntries().length).toEqual(1);

        collection.state.date = moment([ 2014, 0, 4 ]);
        expect(collection.dayEntries().length).toEqual(2);

        collection.state.date = moment([ 2014, 0, 16 ]);
        expect(collection.dayEntries().length).toEqual(0);
      });
    });
  });
});