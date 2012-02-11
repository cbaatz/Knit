require 'coffee-script' # For resolving uncompiled CoffeeScript requires

path          = require 'path'
fs            = require 'fs'
cli           = require './cli'
configuration = require './configuration'
routes        = require './routes'
log         = require './log'

VERSION = '0.5.0-dev'

showUsage = () ->
  # Help should probably not be logged to logger, just print to console
  console.info "Usage: #{ path.basename program } COMMAND [config] [args]"
  console.info ""
  console.info "Commands:"
  console.info "    serve          Serve targets as a webserver."
  console.info "    write          Write targets to files."
  console.info ""
  console.info "Options:"
  console.info "    --version      Show Knit version."
  console.info "    --help         Show Knit usage help (this)."
  console.info ""
  console.info "    Other options are arbitrary and available to config files to use as they see fit."
  console.info "    --flag         Sets option named 'flag' to true."
  console.info "    --no-flag      Sets option named 'flag' to false."
  console.info "    --flag=val     Sets option named 'flag' to 'val'."
  console.info "    -f             Sets option named 'f' to true."
  console.info ""

# Parse command
process.argv.shift() # Shave off coffee/node command
[program, params, positionals] = cli.parse(process.argv)

# Simple command validation/selection
errors = []
action = undefined
configName = undefined

# Get positional arguments
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
  log.error "#{ error }" for error in errors
else
  # Config files can access command line params from the global
  # variable 'knit'. For example: compress: knit?.compress ? false
  global.knit = params
  global.knit.log = log # Give resource files access to logger
  global.knit.action ?= action # Action available to config files
  global.knit.args = positionals # Provide positional arguments as args
  # NOTE: Positionals thus only make sense with an explicit config name.

  switch action
    when undefined then showUsage()
    when 'version' then console.info "#{ VERSION }" # Output, not log
    when 'help' then showUsage()
    when 'serve'
      if positionals.length >= 1
        configName = positionals.shift()
      server = require './server'
      config = -> configuration.load configName # Reload each each request
      initialConfig = config()
      log.debug "Config file: #{ initialConfig.FILENAME }"
      log.debug "Working dir: #{ process.cwd() }"
      server.serve(initialConfig.server, -> routes.flatten config().routes)
    when 'write'
      if positionals.length >= 1
        configName = positionals.shift()
      writer = require './writer'
      config = configuration.load configName # Only load once
      log.debug "Config file: #{ config.FILENAME }"
      log.debug "Working dir: #{ process.cwd() }"
      writer.write(config.writer, routes.flatten config.routes)
    else
      # If action is none of the above, assume 'write' action with
      # resource file of the 'action' name.
      configName = action
      writer = require './writer'
      config = configuration.load configName # Only load once
      log.debug "Config file: #{ config.FILENAME }"
      log.debug "Working dir: #{ process.cwd() }"
      writer.write(config.writer, routes.flatten config.routes)
