(function() {
  var http, p;
  http = require('http');
  p = require('path');
  exports.serve = function(config, loadResources) {
    var mimeType, path, urlStripRe, _, _fn, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    if (config == null) {
      config = {};
    }
    if (config != null) {
      if ((_ref = config.port) == null) {
        config.port = 8081;
      }
    }
    if (config != null) {
      if ((_ref2 = config.proxyPort) == null) {
        config.proxyPort = 8080;
      }
    }
    if (config != null) {
      if ((_ref3 = config.host) == null) {
        config.host = '127.0.0.1';
      }
    }
    if (config != null) {
      if ((_ref4 = config.proxyHost) == null) {
        config.proxyHost = '127.0.0.1';
      }
    }
    if (config != null) {
      if ((_ref5 = config.root) == null) {
        config.root = '.';
      }
    }
    urlStripRe = new RegExp("^" + (config.root.replace(/\//g, '\\/')));
    http.createServer(function(req, res) {
      var compile, mimeType, poptions, preq, r, url, _ref6;
      r = loadResources();
      url = p.resolve('/', req.url.replace(urlStripRe, ''));
      if (url in r) {
        _ref6 = r[url], mimeType = _ref6[0], compile = _ref6[1];
        return compile(function(data) {
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Cache-Control', 'no-cache');
          res.writeHead(200);
          res.write(data);
          console.log("Knit served " + req.url);
          return res.end();
        });
      } else {
        poptions = {
          host: config.proxyHost,
          port: config.proxyPort,
          path: req.url,
          method: req.method,
          headers: req.headers
        };
        preq = http.request(poptions, function(pres) {
          res.writeHead(pres.statusCode, pres.headers);
          pres.addListener('data', function(chunk) {
            return res.write(chunk, 'binary');
          });
          return pres.addListener('end', function() {
            return res.end();
          });
        });
        preq.on('error', function(e) {
          return res.end();
        });
        req.addListener('data', function(chunk) {
          return preq.write(chunk, 'binary');
        });
        return req.addListener('end', function() {
          return preq.end();
        });
      }
    }).listen(config.port, config.host);
    console.log("Serving at " + config.host + ":" + config.port + ":");
    _ref6 = loadResources();
    _fn = function(path, _arg) {
      var mimeType, url, _;
      mimeType = _arg[0], _ = _arg[1];
      url = p.resolve('/', p.join(config.root, path));
      return console.log("    " + url + " (as " + mimeType + ")");
    };
    for (path in _ref6) {
      _ref7 = _ref6[path], mimeType = _ref7[0], _ = _ref7[1];
      _fn(path, [mimeType, _]);
    }
    return console.log("All other requests are proxied to " + config.proxyHost + ":" + config.proxyPort + ".");
  };
}).call(this);
