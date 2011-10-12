(function() {
  var VERSION, compilers, fs, hasRun, p, program;
  require('coffee-script');
  p = require('path');
  fs = require('fs');
  program = require('commander');
  compilers = require('./compilers');
  VERSION = '0.1.4';
  program.version(VERSION).option('-n, --no-compress', 'Do not compress targets').option('-k, --knit-path <path>', 'Path to _knit file').option('-p, --port <port>', 'Knit port [8081]', Number, 8081).option('-h, --host <host>', 'Knit host [127.0.0.1]', String, '127.0.0.1').option('-P, --proxy-port <port>', 'Proxy port [8080]', Number, 8080).option('-h, --proxy-host <host>', 'Proxy host [127.0.0.1]', String, '127.0.0.1');
  hasRun = false;
  program.command('build').description('Build Knit resources to files.').action(function(env) {
    var buildRoot, builder, compress, config, knitPath, resources, _ref, _ref2, _ref3, _ref4;
    builder = require('./builder');
    hasRun = true;
    knitPath = program.knitPath || '.';
    config = (_ref = require(p.join(knitPath, '_knit'))) != null ? _ref.config : void 0;
    compress = (_ref2 = (_ref3 = program.compress) != null ? _ref3 : config != null ? config.compress : void 0) != null ? _ref2 : true;
    buildRoot = (config != null ? (_ref4 = config.builder) != null ? _ref4.root : void 0 : void 0) || '.';
    console.log("Building " + (compress ? '' : 'un') + "compressed targets to filesystem...");
    resources = compilers.knit('/', knitPath, knitPath, {
      compress: compress
    });
    return builder.build(buildRoot, resources);
  });
  program.command('serve').description('Serve Knit resources over HTTP with proxy delegation.').action(function(env) {
    var configPath, knitPath, mimeType, path, proxy, resources, _, _fn, _ref, _ref2;
    proxy = require('./proxy');
    hasRun = true;
    knitPath = program.knitPath || '.';
    configPath = p.join(knitPath, '_knit');
    resources = function() {
      var compress, config, serveRoot, _ref, _ref2, _ref3, _ref4;
      config = (_ref = require(configPath)) != null ? _ref.config : void 0;
      serveRoot = (config != null ? (_ref2 = config.server) != null ? _ref2.root : void 0 : void 0) || '.';
      serveRoot = p.resolve('/', serveRoot);
      compress = (_ref3 = (_ref4 = program.compress) != null ? _ref4 : config != null ? config.compress : void 0) != null ? _ref3 : false;
      return compilers.knit(serveRoot, knitPath, knitPath, {
        compress: compress
      });
    };
    proxy.server(resources, program.proxyPort, program.proxyHost).listen(program.port, program.host);
    console.log("Knit serving at " + program.host + ":" + program.port + ":");
    _ref = resources();
    _fn = function(path, _arg) {
      var mimeType, _;
      mimeType = _arg[0], _ = _arg[1];
      return console.log("    " + path + " (as " + mimeType + ")");
    };
    for (path in _ref) {
      _ref2 = _ref[path], mimeType = _ref2[0], _ = _ref2[1];
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
