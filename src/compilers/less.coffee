less = require 'less'
fs = require 'fs'
p = require 'path'

exports.getResources = (targetPath, root, source, config) ->
  config               = config?.less ? {}
  config?.compress     ?= false
  config?.paths        ?= []
  config?.dependencies ?= []
  config.paths.push(root)
  sourcePath = p.join root, source
  options =
    optimization: 1
    paths: config.paths
    filename: sourcePath
  parser = new less.Parser options
  compile = (messenger) ->
    fs.readFile options.filename, (err, data) =>
      if err then return console.error err
      parser.parse data.toString(), (err, tree) =>
        if err then return console.error err
        messenger(tree.toCSS(compress: config.compress))

  result = {}
  result[targetPath] = ['text/css', compile]
  result
