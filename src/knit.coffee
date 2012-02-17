require 'coffee-script' # For resolving uncompiled CoffeeScript requires

path          = require 'path'
fs            = require 'fs'
cli           = require './cli'
resources     = require './resources'
{flatten}     = require './flatten'
log           = require './log'

VERSION = '0.6.0-dev'

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
if params?.args # args parameter not allowed since used for positionals
  errors.push("--args is a reserved parameter. Please use an alternative.")

if errors.length > 0
  # Display errors and exit
  log.error "#{ error }" for error in errors
else
  # Resource files can access command line params from an object the
  # resources function they should export get passed.
  knit = params
  knit.action ?= action # Action available to resource files
  knit.args = positionals # Provide positional arguments as args
  # NOTE: Positionals thus only make sense with an explicit resource name.

  switch action
    when undefined
      showUsage()
      log.debug "SHOULD ALSO SHOW LIST OF CONFIG FILES ON PATH"
    when 'version' then console.info "#{ VERSION }" # Output, not log
    when 'help' then showUsage()
    else
      # If action is neither 'write' nor 'serve' then assume write
      # action with a resource file of the 'action' name.
      if action != 'write' and action != 'serve'
        resourceName = action
        action = 'write'
      else if positionals.length >= 1
        resourceName = positionals.shift()
      resource = resources.load resourceName
      log.debug "Working dir: #{ process.cwd() }"
      log.debug "Resource: #{ resource.NAME or 'NO NAME' } (#{ resource.FILENAME })"
      log.debug "Description: #{ resource.DESCRIPTION or 'NO DESCRIPTION' }"
      if action == 'serve'
        server = require './server'
        server.serve(
          resource.server(action, knit, log),
          flatten resource.resources(action, knit, log))
      else
        writer = require './writer'
        writer.write(
          resource.writer(action, knit, log),
          flatten resource.resources(action, knit, log))
