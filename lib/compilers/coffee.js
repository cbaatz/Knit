(function() {
  var Dependency, Stitch, eco, fs, p, stitch, uglify;
  fs = require('fs');
  p = require('path');
  uglify = require('uglify-js');
  eco = require('eco');
  Dependency = require('./hem/dependency');
  Stitch = require('./hem/stitch');
  stitch = require('../../assets/stitch');
  exports.getResources = function(targetPath, root, source, config) {
    var compiler, locals, main, result, sourcePath, _ref, _ref2, _ref3, _ref4;
    config = (_ref = config != null ? config.coffee : void 0) != null ? _ref : {};
    if (config != null) {
      if ((_ref2 = config.compress) == null) {
        config.compress = false;
      }
    }
    if (config != null) {
      if ((_ref3 = config.libraries) == null) {
        config.libraries = [];
      }
    }
    if (config != null) {
      if ((_ref4 = config.dependencies) == null) {
        config.dependencies = [];
      }
    }
    sourcePath = p.dirname(p.join(root, source));
    main = p.join(p.dirname(source), p.basename(source, p.extname(source)));
    locals = [sourcePath];
    compiler = function(messenger) {
      var content, dependencyModules, libraryContent, localModules, moduleContent, modules, path;
      dependencyModules = new Dependency(config.dependencies);
      localModules = new Stitch(locals);
      modules = dependencyModules.resolve().concat(localModules.resolve());
      moduleContent = stitch({
        identifier: 'require',
        modules: modules,
        main: main
      });
      libraryContent = ((function() {
        var _i, _len, _ref5, _results;
        _ref5 = config.libraries;
        _results = [];
        for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
          path = _ref5[_i];
          _results.push(fs.readFileSync(p.join(root, path), 'utf8'));
        }
        return _results;
      })()).join("\n");
      content = [libraryContent, moduleContent].join("\n");
      if (config.compress) {
        content = uglify(content);
      }
      return messenger(content);
    };
    result = {};
    result[targetPath] = ['application/javascript', compiler];
    return result;
  };
}).call(this);
