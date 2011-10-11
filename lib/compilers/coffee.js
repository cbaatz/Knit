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
    var compiler, compress, dependencies, libraries, locals, result, sourcePath, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
    sourcePath = p.join(root, source);
    compress = (_ref = config != null ? (_ref2 = config.coffee) != null ? _ref2.compress : void 0 : void 0) != null ? _ref : true;
    libraries = (_ref3 = config != null ? (_ref4 = config.coffee) != null ? _ref4.libraries : void 0 : void 0) != null ? _ref3 : [];
    dependencies = (_ref5 = config != null ? (_ref6 = config.coffee) != null ? _ref6.dependencies : void 0 : void 0) != null ? _ref5 : [];
    locals = [sourcePath];
    compiler = function(messenger) {
      var content, dependencyModules, libraryContent, localModules, moduleContent, modules, path;
      dependencyModules = new Dependency(dependencies);
      localModules = new Stitch(locals);
      modules = dependencyModules.resolve().concat(localModules.resolve());
      moduleContent = stitch({
        identifier: 'require',
        modules: modules
      });
      libraryContent = ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = libraries.length; _i < _len; _i++) {
          path = libraries[_i];
          _results.push(fs.readFileSync(p.join(root, path), 'utf8'));
        }
        return _results;
      })()).join("\n");
      content = [libraryContent, moduleContent].join("\n");
      if (compress) {
        content = uglify(content);
      }
      return messenger(content);
    };
    result = {};
    result[targetPath] = ['application/javascript', compiler];
    return result;
  };
}).call(this);
