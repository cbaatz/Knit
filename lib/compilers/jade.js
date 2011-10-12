(function() {
  var fs, jade, p;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  jade = require('jade');
  fs = require('fs');
  p = require('path');
  exports.getResources = function(targetPath, root, source, config) {
    var compile, debug, locals, options, pretty, result, self, sourcePath, _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    sourcePath = p.join(root, source);
    self = (_ref = config != null ? (_ref2 = config.jade) != null ? _ref2.self : void 0 : void 0) != null ? _ref : false;
    debug = (_ref3 = config != null ? (_ref4 = config.jade) != null ? _ref4.debug : void 0 : void 0) != null ? _ref3 : false;
    pretty = (_ref5 = config != null ? (_ref6 = config.jade) != null ? _ref6.pretty : void 0 : void 0) != null ? _ref5 : false;
    locals = (_ref7 = config != null ? (_ref8 = config.jade) != null ? _ref8.locals : void 0 : void 0) != null ? _ref7 : {};
    options = {
      self: false,
      debug: debug,
      compileDebug: false,
      pretty: pretty,
      filename: sourcePath
    };
    compile = function(messenger) {
      return fs.readFile(options.filename, __bind(function(err, data) {
        var fn;
        if (err) {
          return console.error(err);
        }
        fn = jade.compile(data.toString(), options);
        return messenger(fn(locals));
      }, this));
    };
    result = {};
    result[targetPath] = ['text/html', compile];
    return result;
  };
}).call(this);
