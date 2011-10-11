(function() {
  var fs, less, p;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  less = require('less');
  fs = require('fs');
  p = require('path');
  exports.getResources = function(targetPath, root, source, config) {
    var compile, compress, options, parser, paths, result, sourcePath, _ref, _ref2;
    sourcePath = p.join(root, source);
    compress = (_ref = config != null ? (_ref2 = config.less) != null ? _ref2.compress : void 0 : void 0) != null ? _ref : true;
    paths = (config != null ? config.paths : void 0) || [];
    paths.push(root);
    options = {
      optimization: 1,
      paths: paths,
      filename: sourcePath
    };
    parser = new less.Parser(options);
    compile = function(messenger) {
      return fs.readFile(options.filename, __bind(function(err, data) {
        if (err) {
          return console.error(err);
        }
        return parser.parse(data.toString(), __bind(function(err, tree) {
          if (err) {
            return console.error(err);
          }
          return messenger(tree.toCSS({
            compress: compress
          }));
        }, this));
      }, this));
    };
    result = {};
    result[targetPath] = ['text/css', compile];
    return result;
  };
}).call(this);
