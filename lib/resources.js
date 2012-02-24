(function() {
  var findCandidates, fs, loadModuleTriples, log, path, resolve;

  path = require('path');

  fs = require('fs');

  log = require('./log');

  resolve = function(fullModuleName) {
    var moduleName, modulePath;
    try {
      modulePath = require.resolve(fullModuleName);
      moduleName = path.basename(modulePath);
      moduleName = path.basename(moduleName, path.extname(moduleName));
      return [moduleName, modulePath];
    } catch (err) {
      return;
    }
  };

  findCandidates = function() {
    var candidates, contrib, f, file, knithome, p, _fn, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3, _ref4;
    candidates = [];
    candidates.push(path.resolve('./knit.js'));
    candidates.push(path.resolve('./.knit.js'));
    candidates.push(path.resolve('./knit.coffee'));
    candidates.push(path.resolve('./.knit.coffee'));
    if (process.env.HOME) {
      knithome = path.resolve("" + process.env.HOME + "/.knit/");
      if (path.existsSync(knithome) && fs.statSync(knithome).isDirectory()) {
        _ref = fs.readdirSync(knithome);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          file = _ref[_i];
          candidates.push(path.resolve(knithome, file));
        }
      }
    }
    _ref3 = ((_ref2 = process.env.KNIT_PATH) != null ? _ref2.split(':') : void 0) || [];
    _fn = function(p) {
      var file, _k, _len3, _ref4, _results;
      _ref4 = fs.readdirSync(p);
      _results = [];
      for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
        file = _ref4[_k];
        _results.push(candidates.push(path.resolve(p, file)));
      }
      return _results;
    };
    for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
      p = _ref3[_j];
      _fn(p);
    }
    contrib = path.resolve(path.dirname(process.mainModule.filename), '../contrib');
    _ref4 = fs.readdirSync(contrib);
    for (_k = 0, _len3 = _ref4.length; _k < _len3; _k++) {
      f = _ref4[_k];
      candidates.push(path.resolve(contrib, f));
    }
    return candidates;
  };

  loadModuleTriples = function(candidates) {
    var moduleTriples, n, paths, tuple, _fn, _i, _len;
    paths = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = candidates.length; _i < _len; _i++) {
        n = candidates[_i];
        _results.push(resolve(n));
      }
      return _results;
    })();
    moduleTriples = [];
    _fn = function(tuple) {
      var module, p;
      if (tuple != null) {
        n = tuple[0], p = tuple[1];
        try {
          delete require.cache[p];
          module = require(p);
          if (((module != null ? module.NAME : void 0) != null) && (typeof (module != null ? module.resources : void 0)) === 'function') {
            return moduleTriples.push([n, p, module]);
          }
        } catch (e) {
          return;
        }
      }
    };
    for (_i = 0, _len = paths.length; _i < _len; _i++) {
      tuple = paths[_i];
      _fn(tuple);
    }
    return moduleTriples;
  };

  exports.list = function() {
    return loadModuleTriples(findCandidates());
  };

  exports.load = function(name) {
    var candidates, file, matching, module, moduleName, modulePath, _fn, _i, _j, _len, _len2, _ref, _ref2, _ref3;
    matching = [];
    candidates = findCandidates();
    _ref = loadModuleTriples(candidates);
    _fn = function(moduleName, modulePath, module) {
      if (name === moduleName) {
        return matching.push([modulePath, module]);
      } else if (moduleName === 'knit' || moduleName === '.knit') {
        return matching.push([modulePath, module]);
      }
    };
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], moduleName = _ref2[0], modulePath = _ref2[1], module = _ref2[2];
      _fn(moduleName, modulePath, module);
    }
    _ref3 = matching[0] || [null, null], modulePath = _ref3[0], module = _ref3[1];
    process.chdir(path.dirname(modulePath));
    if (!modulePath) {
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
      module.FILENAME = modulePath;
      return module;
    }
  };

}).call(this);
