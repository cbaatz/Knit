(function() {
  var cleanRoutes, http, log, p, startServer;

  http = require('http');

  p = require('path');

  log = require('./log');

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
    var cleaned, handler, loadRoutes, path, proxyName, _ref, _ref2, _ref3, _ref4, _ref5;
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
    proxyName = "" + config.proxyHost + ":" + config.proxyPort;
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
    startServer(config, loadRoutes);
    log.info("Knit serving at " + config.host + ":" + config.port + ":");
    _ref5 = loadRoutes();
    for (path in _ref5) {
      handler = _ref5[path];
      log.info("" + path);
    }
    return log.info("otherwise proxy for " + proxyName);
  };

  startServer = function(config, loadRoutes) {
    var proxyName;
    proxyName = "" + config.proxyHost + ":" + config.proxyPort;
    return http.createServer(function(req, res) {
      var handler, poptions, preq, routes, url;
      routes = loadRoutes();
      url = req.url;
      if (req.url in routes) {
        req.on('end', function() {
          return log.info("" + req.method + " " + req.url);
        });
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Type', 'text/plain');
        handler = routes[url];
        res.setMime = function(mime) {
          return this.setHeader('Content-Type', mime);
        };
        res.endWithMime = function(data, mime) {
          this.setHeader('Content-Type', mime);
          return this.end(data);
        };
        return handler(res);
      } else {
        req.on('end', function() {
          return log.debug("" + req.method + " " + proxyName + req.url);
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
          log.debug("Possible socket close (ignored): " + (JSON.stringify(e)));
          log.error("" + e.message + " (" + req.method + " " + proxyName + req.url + ")");
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
