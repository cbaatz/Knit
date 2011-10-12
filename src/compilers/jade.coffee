jade = require 'jade'
fs = require 'fs'
p = require 'path'

exports.getResources = (targetPath, root, source, config) ->
  sourcePath = p.join root, source
  self = config?.jade?.self ? false
  debug = config?.jade?.debug ? false
  pretty = config?.jade?.pretty ? false
  locals = config?.jade?.locals ? {}
  options =
    self: false
    debug: debug
    compileDebug: false
    pretty: pretty
    filename: sourcePath
  compile = (messenger) ->
    fs.readFile options.filename, (err, data) =>
      if err then return console.error err
      fn = jade.compile data.toString(), options
      messenger fn(locals)

  result = {}
  result[targetPath] = ['text/html', compile]
  result
