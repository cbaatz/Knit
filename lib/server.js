(function() {
  var cleanResources, flatten, http, knitstream, path, startServer;

  http = require('http');

  path = require('path');

  flatten = require('./flatten');

  knitstream = require('./knitstream');

  cleanResources = function(resources) {
    var handler, rs, url;
    rs = {};
    for (url in resources) {
      handler = resources[url];
      rs[path.resolve('/', url)] = handler;
    }
    return rs;
  };

  exports.serve = function(module, action, knit, log) {
    var config, handler, path, proxyName, resources, _ref, _ref2, _ref3, _ref4;
    config = ((module != null ? module.server : void 0) || function() {
      return {};
    })(action, knit, log);
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
    resources = cleanResources(flatten.module(module, action, knit, log));
    startServer(config, resources, log);
    log.info("Knit serving at " + config.host + ":" + config.port + ":");
    for (path in resources) {
      handler = resources[path];
      log.info("" + path);
    }
    return log.info("otherwise proxy for " + proxyName);
  };

  startServer = function(config, resources, log) {
    var proxyName;
    proxyName = "" + config.proxyHost + ":" + config.proxyPort;
    return http.createServer(function(req, res) {
      var handler, poptions, preq, stream, url;
      url = req.url;
      if (req.url in resources) {
        handler = resources[url];
        req.on('end', function() {
          return log.info("" + req.method + " " + req.url);
        });
        stream = knitstream.fromHTTPResponse(res);
        stream.setHeader('Cache-Control', 'no-cache');
        stream.setHeader('Content-Type', 'text/plain');
        return handler(stream);
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
