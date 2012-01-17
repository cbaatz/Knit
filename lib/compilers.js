(function() {
  var compilers, fs, getResources, loadConfig, p;

  fs = require('fs');

  p = require('path');

  loadConfig = require('./config').loadConfig;

  getResources = function(target, root, source, config) {
    var compile, k, resources, subtarget, type, v, _ref, _ref2, _ref3;
    root = fs.realpathSync(p.join(root, source));
    config = loadConfig(root, config);
    resources = {};
    _ref = config.targets;
    for (subtarget in _ref) {
      _ref2 = _ref[subtarget], source = _ref2[0], type = _ref2[1];
      compile = compilers[type];
      _ref3 = compile(subtarget, root, source, config);
      for (k in _ref3) {
        v = _ref3[k];
        resources[p.join(target, k)] = v;
      }
    }
    return resources;
  };

  compilers = {
    knit: getResources,
    r: require('./compilers/r').getResources,
    file: require('./compilers/file').getResources,
    string: require('./compilers/string').getResources,
    less: require('./compilers/less').getResources,
    html: require('./compilers/html').getResources,
    jade: require('./compilers/jade').getResources,
    coffee: require('./compilers/coffee').getResources
  };

  module.exports = compilers;

}).call(this);
