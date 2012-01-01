fs = require 'fs'
p = require 'path'

exports.getResources = (targetPath, root, source, config) ->
  sourcePath = p.join root, source
  compile = (messenger) ->
    fs.readFile sourcePath, (err, data) =>
      if err then return console.error err
      messenger(data)

  result = {}
  result[targetPath] = ['text/html', compile]
  result
