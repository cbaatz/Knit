http = require 'http'

exports.server = (resources, port, host) ->
  http.createServer( (req, res) ->
    if req.url of resources
      [mimeType, compile] = resources[req.url]
      compile (data) ->
        res.setHeader('Content-Type', mimeType)
        res.writeHead 200
        res.write data
        console.log "Knit served #{ req.url }"
        res.end()
    else
      poptions =
        host: host
        port: port
        path: req.url
        method: req.method
        headers: req.headers
      preq = http.request poptions, (pres) ->
        res.writeHead pres.statusCode, pres.headers
        pres.addListener 'data', (chunk) -> res.write chunk, 'binary'
        pres.addListener 'end', () -> res.end()
      preq.on 'error', (e) ->
        console.error ("IGNORING socket close: " + JSON.stringify e)
      req.addListener 'data', (chunk) -> preq.write chunk, 'binary'
      req.addListener 'end', () -> preq.end()
  )
