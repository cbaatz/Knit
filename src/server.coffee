http = require 'http'
p = require 'path'

exports.serve = (config, routes) ->
  config            ?= {}
  config?.port      ?= 8081
  config?.proxyPort ?= 8080
  config?.host      ?= '127.0.0.1'
  config?.proxyHost ?= '127.0.0.1'

  # TODO: Possible to reload routes. Create a function of the below
  # that reloads routes if 'routes' variable is a function.

  # Ensure paths start with '/'
  cleanRoutes = {}
  cleanRoutes[p.resolve '/', path] = handler for path, handler of routes
  routes = cleanRoutes

  console.log "Serving at #{ config.host }:#{ config.port }:"
  for path, handler of routes
    do (path, handler) ->
      # TODO: Display mime-type and other meta info?
      console.log "    #{ path }"
  console.log "All other requests are proxied to #{ config.proxyHost }:#{ config.proxyPort }."

  http.createServer((req, res) ->
    url = req.url
    if req.url of routes
      # Serve resources specified in routes
      # [mimeType, compile] = r[url]
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
