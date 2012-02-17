(function() {
  var listResources, p;

  p = require('path');

  listResources = function(resources) {
    var handlerOrResources, list, resource, _fn;
    list = [];
    _fn = function(resource, handlerOrResources) {
      var h, hor, r, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
      if (typeof handlerOrResources === 'function') {
        return list.push([resource, handlerOrResources]);
      } else if (handlerOrResources instanceof Array) {
        _results = [];
        for (_i = 0, _len = handlerOrResources.length; _i < _len; _i++) {
          hor = handlerOrResources[_i];
          _results.push((function(hor) {
            var h, r, _j, _len2, _ref, _ref2, _results2;
            _ref = listResources(hor);
            _results2 = [];
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              _ref2 = _ref[_j], r = _ref2[0], h = _ref2[1];
              _results2.push(list.push([p.join(resource, r), h]));
            }
            return _results2;
          })(hor));
        }
        return _results;
      } else if (typeof handlerOrResources === 'object') {
        _ref = listResources(handlerOrResources);
        _results2 = [];
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          _ref2 = _ref[_j], r = _ref2[0], h = _ref2[1];
          _results2.push(list.push([p.join(resource, r), h]));
        }
        return _results2;
      }
    };
    for (resource in resources) {
      handlerOrResources = resources[resource];
      _fn(resource, handlerOrResources);
    }
    return list;
  };

  exports.flatten = function(resources) {
    var flatResources, handler, resource, _i, _len, _ref, _ref2;
    flatResources = {};
    _ref = listResources(resources);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], resource = _ref2[0], handler = _ref2[1];
      flatResources[resource] = handler;
    }
    return flatResources;
  };

}).call(this);
