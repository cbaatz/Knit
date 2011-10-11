(function() {
  var fs, p;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  fs = require('fs');
  p = require('path');
  exports.getResources = function(targetPath, root, source, config) {
    var compile, result, sourcePath;
    sourcePath = p.join(root, source);
    compile = function(messenger) {
      return fs.readFile(sourcePath, __bind(function(err, data) {
        if (err) {
          return console.error(err);
        }
        return messenger(data);
      }, this));
    };
    result = {};
    result[targetPath] = ['text/css', compile];
    return result;
  };
}).call(this);
