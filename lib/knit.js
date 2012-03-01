(function() {
  var VERSION, action, cli, cwd, error, errors, fs, knit, log, module, params, path, positionals, program, resourceName, resources, showAvailableResources, showUsage, _i, _len, _ref;

  require('coffee-script');

  path = require('path');

  fs = require('fs');

  cli = require('./cli');

  log = require('./log');

  resources = require('./resources');

  VERSION = '0.6.2';

  showUsage = function() {
    console.info("Usage: " + (path.basename(program)) + " COMMAND [resource module] [args]");
    console.info("");
    console.info("Commands:");
    console.info("    serve          Serve targets as a webserver.");
    console.info("    write          Write targets to files.");
    console.info("");
    console.info("Options:");
    console.info("    --version      Show Knit version.");
    console.info("    --help         Show Knit usage help (this).");
    console.info("");
    console.info("    Other options are arbitrary and available to resource files to use as they see fit.");
    console.info("    --flag         Sets option named 'flag' to true.");
    console.info("    --no-flag      Sets option named 'flag' to false.");
    console.info("    --flag=val     Sets option named 'flag' to 'val'.");
    console.info("    -f             Sets option named 'f' to true.");
    return console.info("");
  };

  showAvailableResources = function() {
    var module, moduleName, modulePath, _i, _len, _ref, _ref2, _results;
    console.info("Available resource modules (if a name appears more than once, the first in the list will be picked):");
    _ref = resources.list();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref2 = _ref[_i], moduleName = _ref2[0], modulePath = _ref2[1], module = _ref2[2];
      _results.push((function(moduleName, modulePath, module) {
        return console.info("" + moduleName + ": " + module.NAME);
      })(moduleName, modulePath, module));
    }
    return _results;
  };

  process.argv.shift();

  _ref = cli.parse(process.argv), program = _ref[0], params = _ref[1], positionals = _ref[2];

  errors = [];

  action = void 0;

  resourceName = void 0;

  if (positionals.length >= 1) action = positionals.shift();

  if (params != null ? params.help : void 0) action = 'help';

  if (params != null ? params.version : void 0) action = 'version';

  if (params != null ? params.args : void 0) {
    errors.push("--args is a reserved parameter. Please use an alternative.");
  }

  if (errors.length > 0) {
    for (_i = 0, _len = errors.length; _i < _len; _i++) {
      error = errors[_i];
      log.error("" + error);
    }
  } else {
    switch (action) {
      case void 0:
        showUsage();
        showAvailableResources();
        break;
      case 'version':
        console.info("" + VERSION);
        break;
      case 'help':
        showUsage();
        break;
      default:
        knit = params;
        knit.args = positionals;
        if (action !== 'write' && action !== 'serve') {
          resourceName = action;
          action = 'write';
        } else if (positionals.length >= 1) {
          resourceName = positionals.shift();
        }
        cwd = process.cwd();
        module = resources.load(resourceName);
        log.debug("Working dir: " + (process.cwd()));
        log.debug("Resource:    " + (module.NAME || 'NO NAME') + " (" + module.FILENAME + ")");
        log.debug("Description: " + (module.DESCRIPTION || 'NO DESCRIPTION'));
        if (action === 'serve') {
          require('./server').serve(module, action, knit, log);
        } else {
          require('./writer').write(module, action, knit, log, cwd);
        }
    }
  }

}).call(this);
