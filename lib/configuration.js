(function() {
  var fs, load, path;

  path = require('path');

  fs = require('fs');

  load = function(moduleName) {
    var config;
    delete require.cache[require.resolve(moduleName)];
    return config = require(moduleName);
  };

  exports.load = function(dir) {
    var config;
    dir = fs.realpathSync(dir);
    try {
      return config = load(path.resolve(dir, 'knit'));
    } catch (errA) {
      try {
        return config = load(path.resolve(dir, '.knit'));
      } catch (errB) {
        console.error("ERROR: No config module found");
        console.error("    ", errA.message);
        console.error("    ", errB.message);
        return process.exit(1);
      }
    }
  };

}).call(this);
