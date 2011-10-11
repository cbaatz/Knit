(function() {
  var compilers, fs, getResources, p;
  fs = require('fs');
  p = require('path');
  getResources = function(target, root, source, config) {
    var compile, configClone, k, knitPath, knitSpec, resources, subtarget, type, v, _ref, _ref2, _ref3, _ref4;
    root = fs.realpathSync(source);
    knitPath = p.join(root, "_knit");
    knitSpec = require(knitPath);
    configClone = {};
    for (k in config) {
      v = config[k];
      configClone[k] = v;
    }
    _ref = knitSpec.config;
    for (k in _ref) {
      v = _ref[k];
      configClone[k] = v;
    }
    resources = {};
    _ref2 = knitSpec.targets;
    for (subtarget in _ref2) {
      _ref3 = _ref2[subtarget], source = _ref3[0], type = _ref3[1];
      compile = compilers[type];
      _ref4 = compile(subtarget, root, source, configClone);
      for (k in _ref4) {
        v = _ref4[k];
        resources[p.join(target, k)] = v;
      }
    }
    return resources;
  };
  compilers = {
    knit: getResources,
    less: require('./compilers/less').getResources,
    coffee: require('./compilers/coffee').getResources,
    string: require('./compilers/string').getResources,
    file: require('./compilers/file').getResources
  };
  module.exports = compilers;
}).call(this);
