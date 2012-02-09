require 'coffee-script' # For resolving uncompiled CoffeeScript requires
path          = require 'path'
fs            = require 'fs'
cli           = require './cli'
configuration = require './configuration'
routes        = require './routes'

VERSION = '0.5.0-dev'

showUsage = () ->
  console.log "Usage: #{ path.basename program } COMMAND [config] [args]"
  console.log ""
  console.log "Commands:"
  console.log "    serve          Serve targets as a webserver."
  console.log "    write          Write targets to files."
  console.log ""
  console.log "Options:"
  console.log "    --version      Show Knit version."
  console.log "    --help         Show Knit usage help (this)."
  console.log ""
  console.log "    Other options are arbitrary and available to config files to use as they see fit."
  console.log "    --flag         Sets option named 'flag' to true."
  console.log "    --no-flag      Sets option named 'flag' to false."
  console.log "    --flag=val     Sets option named 'flag' to 'val'."
  console.log "    -f             Sets option named 'f' to true."
  console.log ""

# Parse command
process.argv.shift() # Shave off coffee/node command
[program, params, positionals] = cli.parse(process.argv)

# Simple command validation/selection
errors = []
action = undefined
configName = undefined

# Get positional arguments
if positionals.length == 0
  errors.push("Command required but none given. See --help for details.")
if positionals.length >= 1
  action = positionals.shift()

# Help and version actions take precedence
if params?.help
  action = 'help'
if params?.version
  action = 'version'

# Check for errors
if params?.action # action parameter not allowed
  errors.push("--action is a reserved parameter. Please use an alternative.")
if params?.args # args parameter not allowed
  errors.push("--args is a reserved parameter. Please use an alternative.")

if errors.length > 0
  # Display errors and exit
  console.log "ERROR: #{ error }" for error in errors
else
  # Config files can access command line params from the global
  # variable 'knit'. For example: compress: knit?.compress ? false
  global.knit = params
  global.knit.action ?= action # Action available to config files
  global.knit.args = positionals # Provide positional arguments as args
  # NOTE: Positionals thus only make sense with an explicit config name.

  switch action
    when 'version' then console.log "#{ VERSION }"
    when 'help' then showUsage()
    when 'serve'
      if positionals.length >= 1
        configName = positionals.shift()
      server = require './server'
      config = -> configuration.load configName # Reload each each request
      initialConfig = config()
      console.log "Config file: #{ initialConfig.FILENAME }"
      server.serve(initialConfig.server, -> routes.flatten config().routes)
    when 'write'
      if positionals.length >= 1
        configName = positionals.shift()
      writer = require './writer'
      config = configuration.load configName # Only load once
      console.log "Config file: #{ config.FILENAME }"
      writer.write(config.writer, routes.flatten config.routes)
    else
      # If action is none of the above, assume 'write' action with
      # resource file of the 'action' name.
      configName = action
      writer = require './writer'
      config = configuration.load configName # Only load once
      console.log "Config file: #{ config.FILENAME }"
      writer.write(config.writer, routes.flatten config.routes)
