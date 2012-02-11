require 'coffee-script' # For resolving uncompiled CoffeeScript requires

path          = require 'path'
fs            = require 'fs'
cli           = require './cli'
resources     = require './resources'
routes        = require './routes'
log           = require './log'

VERSION = '0.5.0'

showUsage = () ->
  # Help should probably not be logged to logger, just print to console
  console.info "Usage: #{ path.basename program } COMMAND [resource module] [args]"
  console.info ""
  console.info "Commands:"
  console.info "    serve          Serve targets as a webserver."
  console.info "    write          Write targets to files."
  console.info ""
  console.info "Options:"
  console.info "    --version      Show Knit version."
  console.info "    --help         Show Knit usage help (this)."
  console.info ""
  console.info "    Other options are arbitrary and available to resource files to use as they see fit."
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
resourceName = undefined

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
if params?.log # log parameter not allowed
  errors.push("--log is a reserved parameter. Please use an alternative.")

if errors.length > 0
  # Display errors and exit
  log.error "#{ error }" for error in errors
else
  # Resource files can access command line params from the global
  # variable 'knit'. For example: compress: knit?.compress ? false
  global.knit = params
  global.knit.log = log # Give resource files access to logger
  global.knit.action ?= action # Action available to resource files
  global.knit.args = positionals # Provide positional arguments as args
  # NOTE: Positionals thus only make sense with an explicit resource name.

  switch action
    when undefined then showUsage()
    when 'version' then console.info "#{ VERSION }" # Output, not log
    when 'help' then showUsage()
    when 'serve'
      if positionals.length >= 1
        resourceName = positionals.shift()
      server = require './server'
      resource = -> resources.load resourceName # Reload each each request
      initialResource = resource()
      log.debug "Resource file: #{ initialResource.FILENAME }"
      log.debug "Working dir: #{ process.cwd() }"
      server.serve(initialResource.server, -> routes.flatten resource().routes)
    when 'write'
      if positionals.length >= 1
        resourceName = positionals.shift()
      writer = require './writer'
      resource = resources.load resourceName # Only load once
      log.debug "Resource file: #{ resource.FILENAME }"
      log.debug "Working dir: #{ process.cwd() }"
      writer.write(resource.writer, routes.flatten resource.routes)
    else
      # If action is none of the above, assume 'write' action with
      # resource file of the 'action' name.
      resourceName = action
      writer = require './writer'
      resource = resources.load resourceName # Only load once
      log.debug "Resource file: #{ resource.FILENAME }"
      log.debug "Working dir: #{ process.cwd() }"
      writer.write(resource.writer, routes.flatten resource.routes)
