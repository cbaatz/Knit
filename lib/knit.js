(function() {
  var VERSION, action, cli, error, errors, flatten, fs, knit, log, params, path, positionals, program, resource, resourceName, resources, server, showUsage, writer, _i, _len, _ref, _ref2;

  require('coffee-script');

  path = require('path');

  fs = require('fs');

  cli = require('./cli');

  resources = require('./resources');

  flatten = require('./flatten').flatten;

  log = require('./log');

  VERSION = '0.6.0-dev';

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
    knit = params;
    if ((_ref2 = knit.action) == null) knit.action = action;
    knit.args = positionals;
    switch (action) {
      case void 0:
        showUsage();
        log.debug("SHOULD ALSO SHOW LIST OF CONFIG FILES ON PATH");
        break;
      case 'version':
        console.info("" + VERSION);
        break;
      case 'help':
        showUsage();
        break;
      default:
        if (action !== 'write' && action !== 'serve') {
          resourceName = action;
          action = 'write';
        } else if (positionals.length >= 1) {
          resourceName = positionals.shift();
        }
        resource = resources.load(resourceName);
        log.debug("Working dir: " + (process.cwd()));
        log.debug("Resource: " + (resource.NAME || 'NO NAME') + " (" + resource.FILENAME + ")");
        log.debug("Description: " + (resource.DESCRIPTION || 'NO DESCRIPTION'));
        if (action === 'serve') {
          server = require('./server');
          server.serve(resource.server(action, knit, log), flatten(resource.resources(action, knit, log)));
        } else {
          writer = require('./writer');
          writer.write(resource.writer(action, knit, log), flatten(resource.resources(action, knit, log)));
        }
    }
  }

}).call(this);
