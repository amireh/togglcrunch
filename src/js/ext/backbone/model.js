define([ 'jquery', 'when', 'backbone' ], function($, when, Backbone) {
  'use strict';

  var save = Backbone.Model.prototype.save;
  var destroy = Backbone.Model.prototype.destroy;
  var fetch = Backbone.Model.prototype.fetch;

  function simulateApiError(validationError) {
    var error = {
      status: 'error',
      messages: [],
      field_errors: {}
    };

    _.each(_.keys(validationError), function(field) {
      var fieldError = validationError[field];

      error.messages.push(fieldError);
      error.field_errors[field] = error.field_errors[field] || [];
      error.field_errors[field].push(fieldError);
    });

    return error;
  }

  /**
   * @class  Backbone.Model
   *
   * Pibi.js Backbone.Model extensions.
   */
  _.extend(Backbone.Model.prototype, {
    name: 'Model',

    /**
     * Simulate a local Backbone.Model error into a form of an API 400 response,
     * so that the handlers don't have to differentiate between local and remote
     * errors.
     */
    _validate: function(attrs, options) {
      var error;

      if (attrs) {
        this.transform(attrs, options);
      }

      this.validationError = null;

      if (!options.validate || !this.validate) {
        return true;
      }

      attrs = _.extend({}, this.attributes, attrs);
      error = this.validate(attrs, options) || null;

      if (!error) {
        return true;
      }

      error = this.validationError = simulateApiError(error);

      this.trigger('invalid', this, error, _.extend({}, options, {
        validationError: error
      }));

      return false;
    },

    /**
     * A chance to cast, coerce, or convert incoming attributes to the proper
     * format you expect.
     *
     * @param  {Object} attrs
     *         The attributes to be set.
     */
    transform: function(attrs, options) {
    },

    save: function(key, value, options) {
      var that    = this;
      var service = when.defer();

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key === null || _.isObject(key)) {
        options = value;
      }

      when(save.apply(this, arguments)).then(function(data) {
        if (!data) {
          that.warn('unable to save; local validation failure:',
            that.validationError);

          return service.reject(that.validationError);
        }

        that.debug('save succeeded:', arguments);

        return service.resolve();
      }).otherwise(function(xhrError) {
        var apiError;

        that.warn('unable to save; XHR failure:', xhrError);

        if ('responseText' in xhrError) {
          apiError = JSON.parse(xhrError.responseText || '{}');
        }
        else if ('field_errors' in xhrError) {
          apiError = xhrError;
        }
        else {
          _.defer(function() {
            console.error(xhrError);
            throw 'Unexpected API error.';
          });
        }

        that.trigger('invalid', that, apiError, _.extend({}, options, {
          validationError: apiError
        }));

        return service.reject(apiError);
      });

      return service.promise;
    },

    destroy: function() {
      var service = when.defer();

      when(destroy.apply(this, arguments)).then(function(resp) {
        service.resolve(resp);
        return resp;
      }).otherwise(function(err) {
        service.reject(err);
        return err;
      });

      return service.promise;
    },

    toString: function() {
      return [ this.name, this.id || this.cid ].join('#');
    }
  }); // Backbone.Model.prototype extensions

  return Backbone.Model;
});