(function() {
  var fs, less, p;

  less = require('less');

  fs = require('fs');

  p = require('path');

  exports.getResources = function(targetPath, root, source, config) {
    var compile, options, parser, result, sourcePath, _ref, _ref2, _ref3;
    config = (_ref = config != null ? config.less : void 0) != null ? _ref : {};
    if (config != null) {
      if ((_ref2 = config.compress) == null) config.compress = false;
    }
    if (config != null) if ((_ref3 = config.paths) == null) config.paths = [];
    config.paths.push(root);
    sourcePath = p.join(root, source);
    options = {
      optimization: 1,
      paths: config.paths,
      filename: sourcePath
    };
    parser = new less.Parser(options);
    compile = function(messenger) {
      var _this = this;
      return fs.readFile(options.filename, function(err, data) {
        if (err) return console.error(err);
        return parser.parse(data.toString(), function(err, tree) {
          if (err) return console.error(err);
          return messenger(tree.toCSS({
            compress: config.compress
          }));
        });
      });
    };
    result = {};
    result[targetPath] = ['text/css', compile];
    return result;
  };

}).call(this);
