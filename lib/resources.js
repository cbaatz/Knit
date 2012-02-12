(function() {
  var fs, log, path, resolve;

  path = require('path');

  fs = require('fs');

  log = require('./log');

  resolve = function(fullModuleName) {
    try {
      return require.resolve(fullModuleName);
    } catch (err) {
      return;
    }
  };

  exports.load = function(name) {
    var candidates, dir, file, knitDir, knitPaths, n, next, p, paths, resolved, resources, _i, _j, _len, _len2, _ref;
    candidates = [];
    if (name != null) {
      knitPaths = ((_ref = process.env.KNIT_PATH) != null ? _ref.split(':') : void 0) || [];
      if (process.env.HOME) {
        candidates.push(path.resolve("" + process.env.HOME + "/.knit/", name));
      }
      for (_i = 0, _len = knitPaths.length; _i < _len; _i++) {
        p = knitPaths[_i];
        candidates.push(path.resolve(p, name));
      }
      knitDir = path.dirname(process.mainModule.filename);
      candidates.push(path.join(knitDir, "../contrib/" + name));
    } else {
      next = path.resolve('.');
      while (dir !== next) {
        dir = next;
        next = path.resolve(dir, '..');
        candidates.push(path.resolve(dir, 'knit'));
        candidates.push(path.resolve(dir, '.knit'));
        process.chdir(path.dirname(resolved));
      }
    }
    paths = (function() {
      var _j, _len2, _results;
      _results = [];
      for (_j = 0, _len2 = candidates.length; _j < _len2; _j++) {
        n = candidates[_j];
        _results.push(resolve(n));
      }
      return _results;
    })();
    paths = (function() {
      var _j, _len2, _results;
      _results = [];
      for (_j = 0, _len2 = paths.length; _j < _len2; _j++) {
        p = paths[_j];
        if (p != null) _results.push(p);
      }
      return _results;
    })();
    resolved = paths[0];
    if (!resolved) {
      if (name) {
        log.error("No resource module '" + name + "' found at:");
      } else {
        log.error("No resource module found at any of the default locations:");
      }
      for (_j = 0, _len2 = candidates.length; _j < _len2; _j++) {
        file = candidates[_j];
        log.error("" + file);
      }
      return process.exit(1);
    } else {
      try {
        delete require.cache[resolved];
        resources = require(resolved);
        resources.FILENAME = resolved;
        return resources;
      } catch (err) {
        log.error("Could not load resource file '" + resolved + "':");
        log.error("" + err);
        return process.exit(1);
      }
    }
  };

}).call(this);
