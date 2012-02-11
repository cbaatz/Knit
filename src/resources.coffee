path = require 'path'
fs   = require 'fs'
log = require './log'

resolve = (fullModuleName) ->
  try
    require.resolve fullModuleName
  catch err
    undefined

exports.load = (name) ->
  # name is the resource module name. This could be undefined if the
  # user provides no explicit name, in which case the resource file
  # should be assumed to be a knit file in the current directory.

  candidates = [] # List of module names to try

  # Now put the various module location possibilities in candidates.
  # We do not want normal node modules to be confused with resource
  # modules so we look for them in specific locations.

  if name?
    knitPaths = process.env.KNIT_PATH?.split(':') or []

    # Do not include current directory since this would pick up any
    # .js/.coffee file by the given name and that's not what we want
    # when we have library getters named things like 'jquery'.
    # candidates.push (path.resolve "./#{ name }")

    # ~/.knit/ if we have a HOME environment variable
    if process.env.HOME
      candidates.push (path.resolve "#{ process.env.HOME }/.knit/#{ name }")
    # Knit paths
    candidates.push(path.resolve(path.join(p, name))) for p in knitPaths
    # Make it easy to bundle standard resource files with the main
    # Knit distribution. These might try to import modules that are
    # not installed (so would exit with an error, which is fine).
    knitDir = path.dirname process.mainModule.filename
    candidates.push (path.join knitDir, "../contrib/#{ name }")
  else
    # Look for default knit resource file and use that as working dir
    next = path.resolve '.'
    while dir != next
      dir = next
      next = path.resolve (path.join dir, '..')
      candidates.push(path.resolve (path.join dir, 'knit'))
      candidates.push(path.resolve (path.join dir, '.knit'))
      # Set working directory to that of the resource file
      process.chdir(path.dirname resolved)

  # Find first existing module
  paths = (resolve n for n in candidates)
  paths = (p for p in paths when p?)
  resolved = paths[0]

  if not resolved
    if name
      log.error "No resource module '#{ name }' found at:"
      log.error "#{ file }" for file in candidates
    else
      log.error "No resource module found at any of the default locations:"
      log.error "#{ file }" for file in candidates
    process.exit(1)
  else
    try
      delete require.cache[resolved]
      resources = require resolved
      resources.FILENAME = resolved
      resources
    catch err
      log.error "Could not load resource file '#{ resolved }':"
      log.error "#{ err }"
      process.exit(1)
