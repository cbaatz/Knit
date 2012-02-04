require 'coffee-script' # For resolving uncompiled CoffeeScript requires
path          = require 'path'
fs            = require 'fs'
cli           = require './cli'
configuration = require './configuration'
routes        = require './routes'

VERSION = '0.4.1'

showUsage = () ->
  console.log "Usage: #{ path.basename program } [options] COMMAND"
  console.log ""
  console.log "Commands:"
  console.log "    serve         Serve targets as a webserver."
  console.log "    write         Write targets to files."
  console.log ""
  console.log "Options:"
  console.log "    --version     Show Knit version."
  console.log "    --help        Show Knit usage help (this)."
  console.log "    --dir=DIR     Use DIR as Knit base directory."
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
if action? and action not in ['serve', 'write']
  errors.push("#{ action } is not a valid command. See --help for details.")
if params?.help # Help takes precedence
  action = 'help'
if params?.version # Version takes precedence
  action = 'version'
if params?.action # Action parameter not allowed
  console.log "ERROR: --action is a reserved parameter. Please use an alternative."
  process.exit 0

# Display errors or perform action
if errors.length > 0
  for error in errors
    console.log "ERROR: #{ error }"
else
  # Config files can access command line params from the global
  # variable 'knit'. For example: compress: knit?.compress ? false
  global.knit = params
  global.knit.action ?= action # Action available to config files

  dir = fs.realpathSync path.resolve(params?.dir or '.') # Knit base dir
  console.log "Base dir: #{ dir }"

  switch action
    when 'version' then console.log "#{ VERSION }"
    when 'help' then showUsage()
    when 'serve'
      server = require './server'
      config = -> configuration.load dir # Reload each each request
      server.serve(config().server, -> routes.flatten config().routes)
    when 'write'
      writer = require './writer'
      config = configuration.load dir # Only load once
      writer.write(config.writer, routes.flatten config.routes)
    else
      previewer = require './previewer'
      console.log "No command. Use --help to see available commands."
      config = configuration.load dir
      previewer.preview(config.previewer, routes.flatten config.routes)
