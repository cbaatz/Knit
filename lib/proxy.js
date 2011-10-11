(function() {
  var http;
  http = require('http');
  exports.server = function(resources, port, host) {
    return http.createServer(function(req, res) {
      var compile, mimeType, poptions, preq, _ref;
      if (req.url in resources) {
        _ref = resources[req.url], mimeType = _ref[0], compile = _ref[1];
        return compile(function(data) {
          res.setHeader('Content-Type', mimeType);
          res.writeHead(200);
          res.write(data);
          console.log("Knit served " + req.url);
          return res.end();
        });
      } else {
        poptions = {
          host: host,
          port: port,
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
          return console.error("IGNORING socket close: " + JSON.stringify(e));
        });
        req.addListener('data', function(chunk) {
          return preq.write(chunk, 'binary');
        });
        return req.addListener('end', function() {
          return preq.end();
        });
      }
    });
  };
}).call(this);
