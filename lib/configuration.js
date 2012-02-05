(function() {
  var fs, path, resolve;

  path = require('path');

  fs = require('fs');

  resolve = function(fullModuleName) {
    try {
      return require.resolve(fullModuleName);
    } catch (err) {
      return;
    }
  };

  exports.load = function(name) {
    var candidates, config, knitDir, knitPaths, name, p, paths, resolved, _i, _j, _len, _len2, _ref;
    candidates = [];
    if (name != null) {
      knitPaths = ((_ref = process.env.KNIT_PATH) != null ? _ref.split(':') : void 0) || [];
      candidates.push(path.resolve("./" + name));
      if (process.env.HOME) {
        candidates.push(path.resolve("" + process.env.HOME + "/" + name));
      }
      for (_i = 0, _len = knitPaths.length; _i < _len; _i++) {
        p = knitPaths[_i];
        candidates.push(path.resolve(path.join(p, name)));
      }
      knitDir = path.dirname(process.mainModule.filename);
      candidates.push(path.join(knitDir, "../configs/" + name));
    } else {
      candidates.push(path.resolve('./knit'));
      candidates.push(path.resolve('./.knit'));
    }
    paths = (function() {
      var _j, _len2, _results;
      _results = [];
      for (_j = 0, _len2 = candidates.length; _j < _len2; _j++) {
        name = candidates[_j];
        _results.push(resolve(name));
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
      console.error("ERROR: Could not find config file. Modules tried:");
      for (_j = 0, _len2 = candidates.length; _j < _len2; _j++) {
        name = candidates[_j];
        console.error("    " + name);
      }
      return process.exit(1);
    } else {
      try {
        delete require.cache[resolved];
        config = require(resolved);
        config.FILENAME = resolved;
        return config;
      } catch (err) {
        console.error("ERROR: Config file threw error while loading:");
        console.error("    ", err.message);
        return process.exit(1);
      }
    }
  };

}).call(this);
