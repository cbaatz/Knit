(function() {
  var VERSION, compilers, fs, hasRun, p, program;
  require('coffee-script');
  p = require('path');
  fs = require('fs');
  program = require('commander');
  compilers = require('./compilers');
  VERSION = '0.1.1';
  program.version(VERSION).option('-n, --no-compress', 'Do not compress targets').option('-k, --knit-path <path>', 'Path to _knit file').option('-p, --port <port>', 'Knit port [8081]', Number, 8081).option('-h, --host <host>', 'Knit host [127.0.0.1]', String, '127.0.0.1').option('-P, --proxy-port <port>', 'Proxy port [8080]', Number, 8080).option('-h, --proxy-host <host>', 'Proxy host [127.0.0.1]', String, '127.0.0.1');
  hasRun = false;
  program.command('build').description('Build Knit resources to files.').action(function(env) {
    var buildRoot, builder, config, knitPath, resources, _ref, _ref2;
    builder = require('./builder');
    hasRun = true;
    knitPath = program.knitPath || '.';
    console.log("Building " + (program.noCompress ? 'un' : '') + "compressed targets to filesystem...");
    resources = compilers.knit('/', [knitPath, 'knit'], {
      compress: program.compress
    });
    config = (_ref = require(p.join(knitPath, '_knit'))) != null ? _ref.config : void 0;
    buildRoot = (config != null ? (_ref2 = config.builder) != null ? _ref2.root : void 0 : void 0) || '.';
    return builder.build(buildRoot, resources);
  });
  program.command('serve').description('Serve Knit resources over HTTP with proxy delegation.').action(function(env) {
    var config, knitPath, mimeType, path, proxy, resources, serveRoot, _, _fn, _ref, _ref2, _ref3;
    proxy = require('./proxy');
    hasRun = true;
    knitPath = program.knitPath || '.';
    config = (_ref = require(p.join(knitPath, '_knit'))) != null ? _ref.config : void 0;
    serveRoot = (config != null ? (_ref2 = config.server) != null ? _ref2.root : void 0 : void 0) || '.';
    serveRoot = p.resolve('/', serveRoot);
    resources = compilers.knit(serveRoot, [knitPath, 'knit'], {
      compress: program.compress
    });
    proxy.server(resources, program.proxyPort, program.proxyHost).listen(program.port, program.host);
    console.log("Knit serving at " + program.host + ":" + program.port + ":");
    _fn = function(path, _arg) {
      var mimeType, _;
      mimeType = _arg[0], _ = _arg[1];
      return console.log("    " + path + " (as " + mimeType + ")");
    };
    for (path in resources) {
      _ref3 = resources[path], mimeType = _ref3[0], _ = _ref3[1];
      _fn(path, [mimeType, _]);
    }
    return console.log("Knit proxies all other requests to " + program.proxyHost + ":" + program.proxyPort + ".");
  });
  program.parse(process.argv);
  exports.parse = function() {
    return program.parse(process.argv);
  };
  if (!hasRun) {
    console.log(program.helpInformation());
  }
}).call(this);
