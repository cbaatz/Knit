http = require 'http'
p = require 'path'

cleanRoutes = (routes) ->
  # Ensure paths start with '/'
  rs = {}
  rs[p.resolve '/', path] = handler for path, handler of routes
  rs

exports.serve = (config, routes) ->
  config            ?= {}
  config?.port      ?= 8081
  config?.proxyPort ?= 8080
  config?.host      ?= '127.0.0.1'
  config?.proxyHost ?= '127.0.0.1'

  if typeof(routes) == 'function'
    loadRoutes = -> cleanRoutes routes()
  else
    cleaned = cleanRoutes routes
    loadRoutes = -> cleaned

  # TODO: Reuse previewer (which should actually read the content to a memory stream)
  console.log "Serving at #{ config.host }:#{ config.port }:"
  console.log "    #{ path }" for path, handler of loadRoutes()
  console.log "All other requests are proxied to #{ config.proxyHost }:#{ config.proxyPort }."

  startServer config, loadRoutes

startServer = (config, loadRoutes) ->
  http.createServer((req, res) ->
    routes = loadRoutes()
    url = req.url
    if req.url of routes # then we should handle the request
      # Print status message for Knit request
      req.on('end', () -> console.log "KNIT  #{ req.method } #{ req.url }")
      # Set default headers before passing on to handler
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Content-Type', 'text/plain')
      # Serve resources specified in routes
      handler = routes[url]
      # Add convenience method to set mime-type
      res.setMime = (mime) -> this.setHeader('Content-Type', mime)
      res.endWithMime = (data, mime) ->
        this.setHeader('Content-Type', mime)
        this.end(data)
      handler res
    else # pass request on to proxy
      # Print status message for Proxy request
      req.on('end', () -> console.log "PROXY #{ req.method } #{ req.url }")
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
        # console.error ("IGNORING socket close: " + JSON.stringify e)
        console.error "ERROR: #{ e.message } for #{ req.method } #{ req.url }"
        res.writeHead(500, e.code)
        res.end("Proxy connection error: #{ e }\n", "utf8")
      req.on('data', (chunk) -> preq.write chunk, 'binary')
      req.on('end', () -> preq.end())
  ).listen(config.port, config.host)
