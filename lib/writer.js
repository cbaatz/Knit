(function() {
  var ensureDirs, fs, log, masqueradeAsHttpResponse, p;

  fs = require('fs');

  p = require('path');

  log = require('./log');

  ensureDirs = function(path) {
    var dir, dirs, previous, _i, _len, _results;
    dirs = p.relative('/', p.resolve(path)).split('/');
    previous = '/';
    _results = [];
    for (_i = 0, _len = dirs.length; _i < _len; _i++) {
      dir = dirs[_i];
      _results.push((function(dir) {
        var current;
        current = p.join(previous, dir);
        if (!p.existsSync(current)) {
          fs.mkdirSync(current);
          log.info("Created directory '" + dir + "' in " + previous);
        }
        return previous = current;
      })(dir));
    }
    return _results;
  };

  masqueradeAsHttpResponse = function(stream) {
    stream.writeContinue = function() {};
    stream.writeHead = function() {};
    stream.statusCode = 0;
    stream.setHeader = function() {};
    stream.getHeader = function() {};
    stream.removeHeader = function() {};
    stream.addTrailers = function() {};
    stream.setMime = function() {};
    stream.endWithMime = function(d, m) {
      return this.end(d);
    };
    return stream;
  };

  exports.write = function(config, routes) {
    var buildDir, handler, path, _ref, _ref2, _ref3, _results;
    if (config == null) config = {};
    if ((_ref = config.root) == null) config.root = '.';
    if ((_ref2 = config.overwrite) == null) config.overwrite = false;
    if ((_ref3 = config.makeDirs) == null) config.makeDirs = true;
    buildDir = p.join(p.resolve(config.root), '/');
    log.debug("Writer output directory (relative): " + config.root);
    log.debug("Writer output directory (absolute): " + buildDir);
    _results = [];
    for (path in routes) {
      handler = routes[path];
      _results.push((function(path, handler) {
        var basename, fullFilePath, res;
        fullFilePath = p.join(buildDir, path);
        basename = p.basename(path);
        if ((basename === '') || /\/$/.test(basename)) {
          return log.warn("IGNORED " + path + ": can't write to a directory.");
        } else {
          if (config.makeDirs) ensureDirs(p.dirname(fullFilePath));
          if (config.overwrite || !(p.existsSync(fullFilePath))) {
            res = masqueradeAsHttpResponse(fs.createWriteStream(fullFilePath));
            res.on('close', function() {
              return log.info("WROTE " + fullFilePath + ": " + res.bytesWritten + " bytes.");
            });
            res.on('error', function(err) {
              return log.error("" + err.message);
            });
            return handler(res);
          } else {
            return log.warn("IGNORED " + path + ": " + fullFilePath + " exists.");
          }
        }
      })(path, handler));
    }
    return _results;
  };

}).call(this);
