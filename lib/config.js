(function() {
  var fs, path;
  path = require('path');
  fs = require('fs');
  exports.loadConfig = function(dir, parentConfig) {
    var config, load;
    dir = fs.realpathSync(dir);
    load = function(filename) {
      var config, k, l, moduleName, thisConfig, v, x, _ref, _ref2;
      moduleName = path.resolve(dir, filename);
      delete require.cache[require.resolve(moduleName)];
      thisConfig = require(moduleName);
      if (parentConfig != null) {
        config = {};
        for (k in parentConfig) {
          v = parentConfig[k];
          if (k !== 'targets') {
            for (l in v) {
              x = v[l];
              if ((_ref = config[k]) == null) {
                config[k] = {};
              }
              config[k][l] = x;
            }
          }
        }
        for (k in thisConfig) {
          v = thisConfig[k];
          for (l in v) {
            x = v[l];
            if ((_ref2 = config[k]) == null) {
              config[k] = {};
            }
            config[k][l] = x;
          }
        }
        return config;
      } else {
        return thisConfig;
      }
    };
    try {
      return config = load('_knit');
    } catch (errA) {
      try {
        return config = load('.knit');
      } catch (errB) {
        console.log("No config module found:");
        console.log("    ", errA.message);
        console.log("    ", errB.message);
        return process.exit(1);
      }
    }
  };
}).call(this);
