(function() {
  var listRoutes, p;

  p = require('path');

  listRoutes = function(routes) {
    var handlerOrRoutes, list, route, _fn;
    list = [];
    _fn = function(route, handlerOrRoutes) {
      var h, hor, r, _i, _j, _len, _len2, _ref, _ref2, _results, _results2;
      if (typeof handlerOrRoutes === 'function') {
        return list.push([route, handlerOrRoutes]);
      } else if (handlerOrRoutes instanceof Array) {
        _results = [];
        for (_i = 0, _len = handlerOrRoutes.length; _i < _len; _i++) {
          hor = handlerOrRoutes[_i];
          _results.push((function(hor) {
            var h, r, _j, _len2, _ref, _ref2, _results2;
            _ref = listRoutes(hor);
            _results2 = [];
            for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
              _ref2 = _ref[_j], r = _ref2[0], h = _ref2[1];
              _results2.push(list.push([p.join(route, r), h]));
            }
            return _results2;
          })(hor));
        }
        return _results;
      } else if (typeof handlerOrRoutes === 'object') {
        _ref = listRoutes(handlerOrRoutes);
        _results2 = [];
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          _ref2 = _ref[_j], r = _ref2[0], h = _ref2[1];
          _results2.push(list.push([p.join(route, r), h]));
        }
        return _results2;
      }
    };
    for (route in routes) {
      handlerOrRoutes = routes[route];
      _fn(route, handlerOrRoutes);
    }
    return list;
  };

  exports.flatten = function(routes) {
    var flatRoutes, handler, route, _i, _len, _ref, _ref2;
    flatRoutes = {};
    _ref = listRoutes(routes);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], route = _ref2[0], handler = _ref2[1];
      flatRoutes[route] = handler;
    }
    return flatRoutes;
  };

}).call(this);
