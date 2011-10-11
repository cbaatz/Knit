# This module compiles modules in dependencies and local folder into a
# single JS file allowing us to then require those modules.

fs           = require 'fs'
p            = require 'path'
uglify       = require 'uglify-js'
eco          = require 'eco' # Required for stich asset
Dependency   = require './hem/dependency'
Stitch       = require './hem/stitch'
stitch       = require '../../assets/stitch'

exports.getResources = (targetPath, root, source, config) ->
  sourcePath = p.join root, source
  compress = config?.coffee?.compress ? true
  libraries = config?.coffee?.libraries ? []
  dependencies = config?.coffee?.dependencies ? []
  locals = [sourcePath]

  # Modules
  compiler = (messenger) ->
    dependencyModules = new Dependency(dependencies)
    localModules = new Stitch(locals)
    modules = dependencyModules.resolve().concat(localModules.resolve())
    moduleContent = stitch(identifier: 'require', modules: modules)

    # Library
    libraryContent = (fs.readFileSync(p.join(root, path), 'utf8') for path in libraries).join("\n")

    content = [libraryContent, moduleContent].join("\n")
    content = uglify(content) if compress

    messenger(content)

  result = {}
  result[targetPath] = ['application/javascript', compiler]
  result
