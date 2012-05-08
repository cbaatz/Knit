http       = require 'http'
path       = require 'path'
{parse}    = require 'url'
httpProxy  = require 'http-proxy'
flatten    = require './flatten'
knitstream = require './knitstream'

cleanResources = (resources) ->
  # Ensure urls start with '/'
  rs = {}
  rs[path.resolve '/', url] = handler for url, handler of resources
  rs

exports.serve = (module, action, knit, log) ->
  # TODO: Resource module is loaded initially and not reloaded if
  # updated after server start. It would be neater to check if the
  # resource file has changed on each request and reload it if it
  # has. This would not include server configuration.

  config            = (module?.server or -> {})(action, knit, log)
  config?.port      ?= 8081
  config?.proxyPort ?= 8080
  config?.host      ?= '127.0.0.1'
  config?.proxyHost ?= '127.0.0.1'
  proxyName = "#{ config.proxyHost }:#{ config.proxyPort }"

  resources = cleanResources flatten.module(module, action, knit, log)
  startServer(config, resources, log)
  # TODO: Write a previewer which reads content and headers to a memory stream
  log.info "Knit serving at #{ config.host }:#{ config.port }:"
  log.info "#{ path }" for path, handler of resources # TODO: mime-type and size
  log.info "otherwise proxy for #{ proxyName }"

startServer = (config, resources, log) ->
  proxyName = "#{ config.proxyHost }:#{ config.proxyPort }"
  proxy = new httpProxy.RoutingProxy()
  log.info "Using http-proxy"
  http.createServer((req, res) ->
    # Ignore querey parameters when checking for local file matches.
    cleanUrl = parse(req.url, true).pathname;
    if cleanUrl of resources # then we should handle the request
      # Serve resources specified in resources
      handler = resources[cleanUrl]
      # Print status message for Knit request
      message = new http.OutgoingMessage()
      req.on('end', () -> log.info "#{ req.method } #{ cleanUrl }")
      # Create a knit stream out of the response
      if req.method == 'HEAD'
        # TODO: Don't know how to finish the response without a body for
        # HEAD requests, so hacking this by setting content-length to 0
        # (which is wrong).
        length = 0
        res.write = (data) ->
          length = length + (data?.length ? 0)
          this.setHeader('Content-Length', 0) # FIXME
        res.end = (data) ->
          length = length + (data?.length ? 0)
          this.setHeader('Content-Length', 0) # FIXME
          message.end.call(this)
      stream = knitstream.fromHTTPResponse(res)
      # Set default headers before passing on to handler
      stream.setHeader('Cache-Control', 'no-cache')
      stream.setHeader('Content-Type', 'text/plain')
      handler stream
    else # pass request on to proxy
      # Print status message for Proxy request
      req.on('end', () -> log.debug "#{ req.method } #{ proxyName }#{ req.url }")
      # Set proxy request details
      # Make sure we update the requested host
      req.headers['host'] = proxyName
      proxy.proxyRequest(req, res, {
        host: config.proxyHost,
        port: config.proxyPort
      });
  ).listen(config.port, config.host)
