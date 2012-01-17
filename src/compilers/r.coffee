requirejs = require('requirejs')
fs = require('fs')
p  = require('path')

exports.getResources = (targetPath, root, source, config) ->
  # config               = config?.coffee ? {}
  # config?.compress     ?= false
  # config?.libraries    ?= []
  # config?.dependencies ?= []
  # TODO: Actually configure config!
  config =
    baseUrl: './'
    name: 'main'
    out: './temp/main.js'
    optimize: 'none'
    exclude: ["CoffeeScript"]

  sourcePath = p.dirname(p.join root, source)
  main = p.join p.dirname(source), p.basename(source, p.extname source)
  locals = [sourcePath]

  # Modules
  compiler = (messenger) ->
    requirejs.optimize(config, (buildResponse) ->
      contents = fs.readFileSync(config.out, 'utf8')
      messenger(contents)
    )

  result = {}
  result[targetPath] = ['application/javascript', compiler]
  result
