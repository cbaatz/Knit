less = require 'less'
fs = require 'fs'
p = require 'path'

exports.getResources = (targetPath, root, source, config) ->
  sourcePath = p.join root, source
  compress = config?.less?.compress ? true
  paths = config?.paths or []
  paths.push(root)
  options =
    optimization: 1
    paths: paths
    filename: sourcePath
  parser = new less.Parser options
  compile = (messenger) ->
    fs.readFile options.filename, (err, data) =>
      if err then return console.error err
      parser.parse data.toString(), (err, tree) =>
        if err then return console.error err
        messenger(tree.toCSS(compress: compress))

  result = {}
  result[targetPath] = ['text/css', compile]
  result
