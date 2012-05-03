require 'coffee-script' # For resolving uncompiled CoffeeScript requires
path      = require 'path'
fs        = require 'fs'
cli       = require './cli'
log       = require './log'
resources = require './resources'

VERSION = '0.6.5'

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

showAvailableResources = () ->
  console.info "Available resource modules (if a name appears more than once, the first in the list will be picked):"
  for [moduleName, modulePath, module] in resources.list()
    do (moduleName, modulePath, module) ->
      console.info "#{ moduleName }: #{ module.NAME }"

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
  switch action
    when undefined
      showUsage()
      showAvailableResources()
    when 'version' then console.info "#{ VERSION }" # Output, not log
    when 'help' then showUsage()
    else
      # Resource files can access command line params from an object
      # the resources function they should export get passed.
      knit = params
      knit.args = positionals # Provide positional arguments as args
      # NOTE: Positionals only make sense with an explicit resource
      # name.

      # If action is neither 'write' nor 'serve' then assume 'write'
      # action with a resource file of the 'action' name.
      if action != 'write' and action != 'serve'
        resourceName = action
        action = 'write'
      else if positionals.length >= 1
        resourceName = positionals.shift()
      # Get current working directory before it possibly changes so we
      # can tell writer about it.
      cwd = process.cwd()
      module = resources.load resourceName
      log.debug "Working dir: #{ process.cwd() }"
      log.debug "Resource:    #{ module.NAME or 'NO NAME' } (#{ module.FILENAME })"
      log.debug "Description: #{ module.DESCRIPTION or 'NO DESCRIPTION' }"
      if action == 'serve'
        require('./server').serve(module, action, knit, log)
      else
        require('./writer').write(module, action, knit, log, cwd)
