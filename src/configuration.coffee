path = require 'path'
fs   = require 'fs'

load = (moduleName) ->
  # Refresh require cache (i.e. reload config)
  delete require.cache[require.resolve moduleName]
  config = require moduleName

exports.load = (dir) ->
  dir = fs.realpathSync dir
  try
    config = load (path.resolve dir, 'knit')
  catch errA
    try
      config = load (path.resolve dir, '.knit')
    catch errB
      console.error "ERROR: No config module found"
      console.error "    ", errA.message
      console.error "    ", errB.message
      process.exit(1)
