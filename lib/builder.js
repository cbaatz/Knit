(function() {
  var fs, p;
  fs = require('fs');
  p = require('path');
  exports.build = function(root, resources) {
    var compile, mimeType, path, _ref, _results;
    _results = [];
    for (path in resources) {
      _ref = resources[path], mimeType = _ref[0], compile = _ref[1];
      _results.push((function(path, compile) {
        var fullPath;
        fullPath = p.join(root, path);
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
