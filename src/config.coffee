path = require 'path'
fs   = require 'fs'

exports.loadConfig = (dir, parentConfig) ->
  dir = fs.realpathSync dir
  load = (filename) ->
    moduleName = path.resolve(dir, filename)
    # Refresh require cache (i.e. reload config)
    delete require.cache[require.resolve moduleName]
    thisConfig = require moduleName
    # Merge parent config with this config
    if parentConfig?
      config = {}
      for k, v of parentConfig when k isnt 'targets'
        for l, x of v
          config[k] ?= {}
          config[k][l] = x
      for k, v of thisConfig
        for l, x of v
          config[k] ?= {}
          config[k][l] = x
      config
    else
      thisConfig

  try
    config = load '_knit'
  catch errA
    try
      config = load '.knit'
    catch errB
      console.log "No config module found:"
      console.log "    ", errA.message
      console.log "    ", errB.message
      process.exit(1)
