(function() {
  var cleanRoutes, http, p, startServer;

  http = require('http');

  p = require('path');

  cleanRoutes = function(routes) {
    var handler, path, rs;
    rs = {};
    for (path in routes) {
      handler = routes[path];
      rs[p.resolve('/', path)] = handler;
    }
    return rs;
  };

  exports.serve = function(config, routes) {
    var cleaned, handler, loadRoutes, path, _ref, _ref2, _ref3, _ref4, _ref5;
    if (config == null) config = {};
    if (config != null) if ((_ref = config.port) == null) config.port = 8081;
    if (config != null) {
      if ((_ref2 = config.proxyPort) == null) config.proxyPort = 8080;
    }
    if (config != null) {
      if ((_ref3 = config.host) == null) config.host = '127.0.0.1';
    }
    if (config != null) {
      if ((_ref4 = config.proxyHost) == null) config.proxyHost = '127.0.0.1';
    }
    if (typeof routes === 'function') {
      loadRoutes = function() {
        return cleanRoutes(routes());
      };
    } else {
      cleaned = cleanRoutes(routes);
      loadRoutes = function() {
        return cleaned;
      };
    }
    console.log("Serving at " + config.host + ":" + config.port + ":");
    _ref5 = loadRoutes();
    for (path in _ref5) {
      handler = _ref5[path];
      console.log("    " + path);
    }
    console.log("All other requests are proxied to " + config.proxyHost + ":" + config.proxyPort + ".");
    return startServer(config, loadRoutes);
  };

  startServer = function(config, loadRoutes) {
    return http.createServer(function(req, res) {
      var handler, poptions, preq, routes, url;
      routes = loadRoutes();
      url = req.url;
      if (req.url in routes) {
        req.on('end', function() {
          return console.log("KNIT  " + req.method + " " + req.url);
        });
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/plain');
        handler = routes[url];
        return handler(res);
      } else {
        req.on('end', function() {
          return console.log("PROXY " + req.method + " " + req.url);
        });
        poptions = {
          host: config.proxyHost,
          port: config.proxyPort,
          path: req.url,
          method: req.method,
          headers: req.headers
        };
        preq = http.request(poptions, function(pres) {
          res.writeHead(pres.statusCode, pres.headers);
          pres.on('data', function(chunk) {
            return res.write(chunk, 'binary');
          });
          return pres.on('end', function() {
            return res.end();
          });
        });
        preq.on('error', function(e) {
          console.error("ERROR: " + e.message + " for " + req.method + " " + req.url);
          res.writeHead(500, e.code);
          return res.end("Proxy connection error: " + e + "\n", "utf8");
        });
        req.on('data', function(chunk) {
          return preq.write(chunk, 'binary');
        });
        return req.on('end', function() {
          return preq.end();
        });
      }
    }).listen(config.port, config.host);
  };

}).call(this);
