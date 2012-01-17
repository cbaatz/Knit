(function() {
  var fs, p, requirejs;

  requirejs = require('requirejs');

  fs = require('fs');

  p = require('path');

  exports.getResources = function(targetPath, root, source, config) {
    var compiler, locals, main, result, sourcePath;
    config = {
      baseUrl: './',
      name: 'main',
      out: './temp/main.js',
      optimize: 'none',
      exclude: ["CoffeeScript"]
    };
    sourcePath = p.dirname(p.join(root, source));
    main = p.join(p.dirname(source), p.basename(source, p.extname(source)));
    locals = [sourcePath];
    compiler = function(messenger) {
      return requirejs.optimize(config, function(buildResponse) {
        var contents;
        contents = fs.readFileSync(config.out, 'utf8');
        return messenger(contents);
      });
    };
    result = {};
    result[targetPath] = ['application/javascript', compiler];
    return result;
  };

}).call(this);
