(function() {
  var VERSION, action, cli, config, configName, configuration, error, errors, fs, initialConfig, log, params, path, positionals, program, routes, server, showUsage, writer, _base, _i, _len, _ref, _ref2;

  require('coffee-script');

  path = require('path');

  fs = require('fs');

  cli = require('./cli');

  configuration = require('./configuration');

  routes = require('./routes');

  log = require('./log');

  VERSION = '0.5.0-dev';

  showUsage = function() {
    console.info("Usage: " + (path.basename(program)) + " COMMAND [config] [args]");
    console.info("");
    console.info("Commands:");
    console.info("    serve          Serve targets as a webserver.");
    console.info("    write          Write targets to files.");
    console.info("");
    console.info("Options:");
    console.info("    --version      Show Knit version.");
    console.info("    --help         Show Knit usage help (this).");
    console.info("");
    console.info("    Other options are arbitrary and available to config files to use as they see fit.");
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

  configName = void 0;

  if (positionals.length >= 1) action = positionals.shift();

  if (params != null ? params.help : void 0) action = 'help';

  if (params != null ? params.version : void 0) action = 'version';

  if (params != null ? params.action : void 0) {
    errors.push("--action is a reserved parameter. Please use an alternative.");
  }

  if (params != null ? params.args : void 0) {
    errors.push("--args is a reserved parameter. Please use an alternative.");
  }

  if (params != null ? params.log : void 0) {
    errors.push("--log is a reserved parameter. Please use an alternative.");
  }

  if (errors.length > 0) {
    for (_i = 0, _len = errors.length; _i < _len; _i++) {
      error = errors[_i];
      log.error("" + error);
    }
  } else {
    global.knit = params;
    global.knit.log = log;
    if ((_ref2 = (_base = global.knit).action) == null) _base.action = action;
    global.knit.args = positionals;
    switch (action) {
      case void 0:
        showUsage();
        break;
      case 'version':
        console.info("" + VERSION);
        break;
      case 'help':
        showUsage();
        break;
      case 'serve':
        if (positionals.length >= 1) configName = positionals.shift();
        server = require('./server');
        config = function() {
          return configuration.load(configName);
        };
        initialConfig = config();
        log.debug("Config file: " + initialConfig.FILENAME);
        log.debug("Working dir: " + (process.cwd()));
        server.serve(initialConfig.server, function() {
          return routes.flatten(config().routes);
        });
        break;
      case 'write':
        if (positionals.length >= 1) configName = positionals.shift();
        writer = require('./writer');
        config = configuration.load(configName);
        log.debug("Config file: " + config.FILENAME);
        log.debug("Working dir: " + (process.cwd()));
        writer.write(config.writer, routes.flatten(config.routes));
        break;
      default:
        configName = action;
        writer = require('./writer');
        config = configuration.load(configName);
        log.debug("Config file: " + config.FILENAME);
        log.debug("Working dir: " + (process.cwd()));
        writer.write(config.writer, routes.flatten(config.routes));
    }
  }

}).call(this);
