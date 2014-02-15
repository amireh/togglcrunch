define([ 'ext/lodash' ], function(_) {
  var inheritArrayAttribute = function(object, key, value) {
    var parent = Object.getPrototypeOf(object);
    var objectValue;

    value = value || [];

    if (parent) {
      value = inheritArrayAttribute(parent, key, value);
    }

    // Avoid null/undefined values
    objectValue = _.result(object, key);

    if (objectValue) {
      value = _.union(value, objectValue);
    }

    return value;
  };

  var inheritAttribute = function(object, key, value) {
    var parent = Object.getPrototypeOf(object);

    value = value || {};

    if (parent) {
      inheritAttribute(parent, key, value);
    }

    _.merge(value, _.result(object, key));

    return value;
  };

  return function(object, key, dontOverride, isArray) {
    var options;
    var inherited;

    if (_.isObject(dontOverride)) {
      options = dontOverride;
    }
    else {
      // legacy compat.
      options = {
        dontOverride: dontOverride,
        isArray: isArray
      };
    }

    inherited = options.isArray ?
      inheritArrayAttribute(object, key, []) :
      inheritAttribute(object, key, {});

    if (!options.dontOverride) {
      object[key] = inherited;
    }

    return inherited;
  };
});