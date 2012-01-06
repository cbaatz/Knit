(function() {
  var fs, p;

  fs = require('fs');

  p = require('path');

  exports.getResources = function(targetPath, root, source, config) {
    var compile, result, sourcePath;
    sourcePath = p.join(root, source);
    compile = function(messenger) {
      var _this = this;
      return fs.readFile(sourcePath, function(err, data) {
        if (err) return console.error(err);
        return messenger(data);
      });
    };
    result = {};
    result[targetPath] = ['text/html', compile];
    return result;
  };

}).call(this);
