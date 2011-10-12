require 'coffee-script' # For resolving uncompiled CoffeeScript requires
p = require 'path'
fs = require 'fs'
program = require 'commander'
compilers = require './compilers'

VERSION = '0.1.3'

program
  .version(VERSION)
  .option('-n, --no-compress', 'Do not compress targets')
  .option('-k, --knit-path <path>', 'Path to _knit file')
  .option('-p, --port <port>', 'Knit port [8081]', Number, 8081)
  .option('-h, --host <host>', 'Knit host [127.0.0.1]', String, '127.0.0.1')
  .option('-P, --proxy-port <port>', 'Proxy port [8080]', Number, 8080)
  .option('-h, --proxy-host <host>', 'Proxy host [127.0.0.1]', String, '127.0.0.1')

hasRun = false

program
  .command('build')
  .description('Build Knit resources to files.')
  .action (env) ->
    builder = require './builder'
    hasRun = true

    knitPath = program.knitPath or '.'
    console.log "Building #{ if program.noCompress then 'un' else '' }compressed targets to filesystem..."
    resources = compilers.knit '/', [knitPath, 'knit'], {compress: program.compress}

    config = require(p.join(knitPath, '_knit'))?.config
    buildRoot = config?.builder?.root or '.'
    builder.build buildRoot, resources

program
  .command('serve')
  .description('Serve Knit resources over HTTP with proxy delegation.')
  .action (env) ->
    proxy = require './proxy'
    hasRun = true

    knitPath = program.knitPath or '.'
    config = require(p.join(knitPath, '_knit'))?.config
    serveRoot = config?.server?.root or '.'
    serveRoot = p.resolve('/', serveRoot) # Ensure root starts with '/'
    resources = compilers.knit serveRoot, [knitPath, 'knit'], {compress: program.compress}
    proxy
      .server(resources, program.proxyPort, program.proxyHost)
      .listen(program.port, program.host)

    console.log "Knit serving at #{ program.host }:#{ program.port }:"
    for path, [mimeType, _] of resources
      do (path, [mimeType, _]) ->
        console.log "    #{ path } (as #{ mimeType })"
    console.log "Knit proxies all other requests to #{ program.proxyHost }:#{ program.proxyPort }."

program.parse(process.argv)

exports.parse = () -> program.parse(process.argv)

if not hasRun
  console.log program.helpInformation()
