(function() {
  var fs, p;
  fs = require('fs');
  p = require('path');
  exports.build = function(config, loadResources) {
    var compile, mimeType, path, _ref, _ref2, _ref3, _results;
    if (config == null) {
      config = {};
    }
    if (config != null) {
      if ((_ref = config.root) == null) {
        config.root = '.';
      }
    }
    console.log("Building targets to filesystem...");
    _ref2 = loadResources();
    _results = [];
    for (path in _ref2) {
      _ref3 = _ref2[path], mimeType = _ref3[0], compile = _ref3[1];
      _results.push((function(path, compile) {
        var fullPath;
        fullPath = p.resolve(p.join(config.root, path.replace(/^\//, '')));
        return compile(function(data) {
          var size;
          fs.writeFileSync(fullPath, data);
          size = data.length;
          return console.log("Wrote " + fullPath + ": " + size + " bytes. DONE.");
        });
      })(path, compile));
    }
    return _results;
  };
}).call(this);
