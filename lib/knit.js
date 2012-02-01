(function() {
  var VERSION, action, cli, config, configuration, dir, error, errors, fs, params, path, positionals, previewer, program, routes, server, showUsage, writer, _base, _i, _len, _ref, _ref2;

  require('coffee-script');

  path = require('path');

  fs = require('fs');

  cli = require('./cli');

  configuration = require('./configuration');

  routes = require('./routes');

  VERSION = '0.4.0';

  showUsage = function() {
    console.log("Usage: " + (path.basename(program)) + " [options] COMMAND");
    console.log("");
    console.log("Commands:");
    console.log("    serve         Serve targets as a webserver.");
    console.log("    write         Write targets to files.");
    console.log("");
    console.log("Options:");
    console.log("    --version     Show Knit version.");
    console.log("    --help        Show Knit usage help (this).");
    console.log("    --dir=DIR     Use DIR as Knit base directory.");
    console.log("");
    console.log("    Other options are arbitrary and available to config files to use as they see fit.");
    console.log("    --flag        Sets option named 'flag' to true.");
    console.log("    --no-flag     Sets option named 'flag' to false.");
    console.log("    --flag=val    Sets option named 'flag' to 'val'.");
    console.log("    -f            Sets option named 'f' to true.");
    return console.log("");
  };

  process.argv.shift();

  _ref = cli.parse(process.argv), program = _ref[0], params = _ref[1], positionals = _ref[2];

  errors = [];

  action = void 0;

  if (positionals.length > 1) {
    errors.push("Too many commands (" + positionals + "); only one allowed.");
  }

  if (positionals.length === 1) action = positionals[0];

  if ((action != null) && (action !== 'serve' && action !== 'write')) {
    errors.push("" + action + " is not a valid command. See --help for details.");
  }

  if (params != null ? params.help : void 0) action = 'help';

  if (params != null ? params.version : void 0) action = 'version';

  if (errors.length > 0) {
    for (_i = 0, _len = errors.length; _i < _len; _i++) {
      error = errors[_i];
      console.log("ERROR: " + error);
    }
  } else {
    global.knit = params;
    if ((_ref2 = (_base = global.knit).action) == null) _base.action = action;
    dir = fs.realpathSync(path.resolve((params != null ? params.dir : void 0) || '.'));
    console.log("Base dir: " + dir);
    switch (action) {
      case 'version':
        console.log("" + VERSION);
        break;
      case 'help':
        showUsage();
        break;
      case 'serve':
        server = require('./server');
        config = function() {
          return configuration.load(dir);
        };
        server.serve(config().server, function() {
          return routes.flatten(config().routes);
        });
        break;
      case 'write':
        writer = require('./writer');
        config = configuration.load(dir);
        writer.write(config.writer, routes.flatten(config.routes));
        break;
      default:
        previewer = require('./previewer');
        console.log("No command. Use --help to see available commands.");
        config = configuration.load(dir);
        previewer.preview(config.previewer, routes.flatten(config.routes));
    }
  }

}).call(this);
