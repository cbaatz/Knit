http = require 'http'
p = require 'path'

exports.serve = (config, loadResources) ->
  config            ?= {}
  config?.port      ?= 8081
  config?.proxyPort ?= 8080
  config?.host      ?= '127.0.0.1'
  config?.proxyHost ?= '127.0.0.1'
  config?.root      ?= '.'
  urlStripRe = new RegExp("^#{ config.root.replace(/\//g, '\\/') }")

  http.createServer((req, res) ->
    r = loadResources() # Configuration is reloaded every request
    # Ensure root starts with '/'
    url = p.resolve '/', req.url.replace(urlStripRe, '')
    if url of r
      [mimeType, compile] = r[url]
      compile (data) ->
        res.setHeader('Content-Type', mimeType)
        res.setHeader('Cache-Control', 'no-cache')
        res.writeHead 200
        res.write data
        console.log "Knit served #{ req.url }"
        res.end()
    else
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
        res.end()
      req.addListener 'data', (chunk) -> preq.write chunk, 'binary'
      req.addListener 'end', () -> preq.end()
  ).listen(config.port, config.host)

  console.log "Serving at #{ config.host }:#{ config.port }:"
  for path, [mimeType, _] of loadResources()
    do (path, [mimeType, _]) ->
      url = p.resolve '/', p.join(config.root, path)
      console.log "    #{ url } (as #{ mimeType })"
  console.log "All other requests are proxied to #{ config.proxyHost }:#{ config.proxyPort }."
