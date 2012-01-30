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

  # TODO: Reuse previewer
  # TODO: Display mime-type and other meta info?
  console.log "Serving at #{ config.host }:#{ config.port }:"
  console.log "    #{ path }" for path, handler of loadRoutes()
  console.log "All other requests are proxied to #{ config.proxyHost }:#{ config.proxyPort }."

  startServer config, loadRoutes

startServer = (config, loadRoutes) ->
  http.createServer((req, res) ->
    routes = loadRoutes()
    url = req.url
    if req.url of routes
      # Serve resources specified in routes
      handler = routes[url]
      handler (data, mimeType) ->
        res.setHeader('Content-Type', mimeType)
        res.setHeader('Cache-Control', 'no-cache')
        res.writeHead 200
        res.write data
        console.log "#{ req.method } #{ req.url }"
        res.end()
    else
      # Or pass request on to proxy
      poptions =
        host: config.proxyHost
        port: config.proxyPort
        path: req.url
        method: req.method
        headers: req.headers
      preq = http.request poptions, (pres) ->
        res.writeHead pres.statusCode, pres.headers
        pres.addListener 'data', (chunk) -> res.write chunk, 'binary'
        pres.addListener 'end', () -> res.end()
      preq.on 'error', (e) ->
        # console.error ("IGNORING socket close: " + JSON.stringify e)
        res.writeHead(500, e.code)
        res.end("Proxy connection error: #{ e }\n", "utf8")
      req.addListener 'data', (chunk) -> preq.write chunk, 'binary'
      req.addListener 'end', () -> preq.end()
  ).listen(config.port, config.host)
