(function() {
  var listRoutes, p;

  p = require('path');

  listRoutes = function(routes) {
    var handlerOrRoutes, list, route, _fn;
    list = [];
    _fn = function(route, handlerOrRoutes) {
      var h, r, _i, _len, _ref, _ref2, _results;
      if (typeof handlerOrRoutes === 'function') {
        return list.push([route, handlerOrRoutes]);
      } else if (typeof handlerOrRoutes === 'object') {
        _ref = listRoutes(handlerOrRoutes);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          _ref2 = _ref[_i], r = _ref2[0], h = _ref2[1];
          _results.push(list.push([p.join(route, r), h]));
        }
        return _results;
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
