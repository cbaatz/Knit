path      = require 'path'
fs        = require 'fs'
log       = require './log'

resolve = (fullModuleName) ->
  try
    modulePath = require.resolve fullModuleName
    moduleName = path.basename modulePath
    moduleName = path.basename moduleName, path.extname(moduleName)
    [moduleName, modulePath]
  catch err
    undefined

findCandidates = () ->
  # We do not want normal node modules to be confused with resource
  # modules so we look for them in specific locations and check that
  # they export a 'resources' function, and have a NAME and
  # DESCRIPTION.

  candidates = [] # List of available modules

  # Only include 'knit' and '.knit' modules from current
  # directory. Explicit endings to avoid loading the "knit" project
  # (infinite loop!).
  candidates.push(path.resolve './knit.js')
  candidates.push(path.resolve './.knit.js')
  candidates.push(path.resolve './knit.coffee')
  candidates.push(path.resolve './.knit.coffee')

  # ~/.knit/ if we have a HOME environment variable
  if process.env.HOME
    knithome = path.resolve("#{ process.env.HOME }/.knit/")
    if fs.existsSync(knithome) and fs.statSync(knithome).isDirectory()
      candidates.push path.resolve(knithome, file) for file in fs.readdirSync(knithome)

  # Knit paths
  for p in (process.env.KNIT_PATH?.split(':') or [])
    do (p) ->
      candidates.push path.resolve(p, file) for file in fs.readdirSync(p)

  # Make it easy to bundle standard resource files with the main Knit
  # distribution.
  contrib = path.resolve(path.dirname(process.mainModule.filename), '../contrib')
  candidates.push path.resolve(contrib, f) for f in fs.readdirSync(contrib)
  candidates

loadModuleTriples = (candidates) ->
  # Try to load candidates and check that they export NAME and resources
  paths = (resolve n for n in candidates)
  moduleTriples = []
  for tuple in paths
    do (tuple) ->
      if tuple?
        [n, p] = tuple
        try
          delete require.cache[p]
          module = require p
          if (typeof module?.resources) == 'function'
            module.NAME = module.NAME or n
            moduleTriples.push([n, p, module])
        catch e
          undefined
  moduleTriples

exports.list = () ->
  loadModuleTriples(findCandidates())

exports.load = (name) ->
  matching = []
  candidates = findCandidates()
  for [moduleName, modulePath, module] in loadModuleTriples(candidates)
    do (moduleName, modulePath, module) ->
      if name == moduleName
        matching.push([modulePath, module])
      else if moduleName == 'knit' or moduleName == '.knit'
        matching.push([modulePath, module])

  # Pick first matching
  [modulePath, module] = matching[0] or [null, null]
  # Set working directory to that of the resource file
  process.chdir(path.dirname modulePath)

  if not modulePath
    if name
      log.error "No resource module '#{ name }' found at:"
    else
      log.error "No resource module found at any of the default locations:"
    log.error "#{ file }" for file in candidates
    process.exit(1)
  else
    module.FILENAME = modulePath
    module
