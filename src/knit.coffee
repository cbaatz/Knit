require 'coffee-script' # For resolving uncompiled CoffeeScript requires
path         = require 'path'
fs           = require 'fs'
compilers    = require './compilers'
cli          = require './cli'
{loadConfig} = require './config'

VERSION = '0.2.0'

showUsage = () ->
  console.log "Usage: #{ path.basename program } [options] COMMAND"
  console.log ""
  console.log "Commands:"
  console.log "    serve         Serve targets as a webserver."
  console.log "    build         Build targets to files."
  console.log ""
  console.log "Options:"
  console.log "    --version     Show Knit version."
  console.log "    --help        Show Knit usage help (this)."
  console.log "    --config=FILE Use Knit config file FILE."
  console.log ""
  console.log "    Other options are arbitrary and available to config files to use as they see fit."
  console.log "    --flag        Sets option named 'flag' to true."
  console.log "    --no-flag     Sets option named 'flag' to false."
  console.log "    --flag=val    Sets option named 'flag' to 'val'."
  console.log "    -f            Sets option named 'f' to true."
  console.log ""

# Parse command
process.argv.shift() # Shave off coffee/node command
[program, params, positionals] = cli.parse(process.argv)

# Simple command validation/selection
errors = []
action = undefined
if positionals.length > 1
  errors.push("Too many commands (#{ positionals }); only one allowed.")
action = positionals[0] if positionals.length == 1
if action? and action not in ['serve', 'build']
  errors.push("#{ action } is not a valid command. See --help for details.")
if params?.help # Help takes precedence
  action = 'help'
if params?.version # Version takes precedence
  action = 'version'

# Display errors or perform action
if errors.length > 0
  for error in errors
    console.log "ERROR: #{ error }"
else
  # Config files can access command line params from the global
  # variable 'knit'. For example: compress: knit?.compress ? false
  global.knit = params
  global.knit.action ?= action # Action available to config files

  dir = path.resolve(params?.dir or '.') # Knit base dir
  # Load resources (target and compile function pairs) from base dir
  loadResources = () -> compilers.knit '/', dir, dir, {}
  switch action
    when 'version' then console.log "#{ VERSION }"
    when 'help' then showUsage()
    when 'serve'
      server = require './server'
      console.log "Loading config from #{ dir }"
      config = loadConfig(dir)
      server.serve config.server, loadResources
    when 'build'
      builder = require './builder'
      console.log "Loading config from #{ dir }..."
      config = loadConfig(dir)
      builder.build config.builder, loadResources
    else
      previewer = require './previewer'
      console.log "No command given, showing preview. Use --help to see available commands.\n"
      console.log "Loading config from #{ dir }..."
      config = loadConfig(dir)
      previewer.preview config, loadResources
