http       = require 'http'
path       = require 'path'
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
  http.createServer((req, res) ->
    url = req.url
    if req.url of resources # then we should handle the request
      # Serve resources specified in resources
      handler = resources[url]
      # Print status message for Knit request
      req.on('end', () -> log.info "#{ req.method } #{ req.url }")
      # Create a knit stream out of the response
      stream = knitstream.fromHTTPResponse(res)
      # Set default headers before passing on to handler
      stream.setHeader('Cache-Control', 'no-cache')
      stream.setHeader('Content-Type', 'text/plain')
      handler stream
    else # pass request on to proxy
      # Print status message for Proxy request
      req.on('end', () -> log.debug "#{ req.method } #{ proxyName }#{ req.url }")
      # Set proxy request details
      poptions =
        host: config.proxyHost
        port: config.proxyPort
        path: req.url
        method: req.method
        headers: req.headers
      # Make proxy request
      preq = http.request poptions, (pres) ->
        res.writeHead pres.statusCode, pres.headers
        pres.on('data', (chunk) -> res.write chunk, 'binary')
        pres.on('end', () -> res.end())
      preq.on 'error', (e) ->
        log.debug "Possible socket close (ignored): #{ JSON.stringify e }"
        log.error "#{ e.message } (#{ req.method } #{ proxyName }#{ req.url })"
        res.writeHead(500, e.code)
        res.end("Proxy connection error: #{ e }\n", "utf8")
      req.on('data', (chunk) -> preq.write chunk, 'binary')
      req.on('end', () -> preq.end())
  ).listen(config.port, config.host)
