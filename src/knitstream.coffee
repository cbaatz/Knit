log = require './log'
# TODO: Add meta-information like mime-type and so on for write-stream
# as well so we can use that when displaying status messages for
# example. This can clearly imp

exports.fromWriteStream = (s) ->
  s.writeContinue = ->
  s.writeHead = ->
  s.statusCode = 0
  s.setHeader = ->
  s.getHeader = ->
  s.removeHeader = ->
  s.addTrailers = ->
  s.setMime = ->
  s.endWithMime = (d, m) -> this.end(d)
  s.log = log
  s

exports.fromHTTPResponse = (s) ->
  s.setMime = (mime) -> this.setHeader('Content-Type', mime)
  s.endWithMime = (data, mime) ->
    this.setHeader('Content-Type', mime)
    this.end(data)
  s.log = log
  s
