path = require 'path'
fs   = require 'fs'

resolve = (fullModuleName) ->
  try
    require.resolve fullModuleName
  catch err
    undefined

exports.load = (name) ->
  # name is the config name. This could be undefined if the user
  # provides no explicit name, in which case the config file should be
  # assumed to be a knit file in the current directory.

  candidates = [] # List of module names to try

  # Now put the various module location possibilities in candidates.
  # We do not want normal node modules to be confused with config
  # modules so we look for them in specific locations.

  if name?
    knitPaths = process.env.KNIT_PATH?.split(':') or []
    # Current directory
    candidates.push (path.resolve "./#{ name }")
    # ~/.knit/ if we have a HOME environment variable
    if process.env.HOME
      candidates.push (path.resolve "#{ process.env.HOME }/.knit/#{ name }")
    # Knit paths
    candidates.push(path.resolve(path.join(p, name))) for p in knitPaths
    # Standard Knit configs to make it easy to bundle useful config
    # files in the main Knit distribution. These might import modules
    # that are not guaranteed to be installed (so would exit with an
    # error, which is fine).
    knitDir = path.dirname process.mainModule.filename
    candidates.push (path.join knitDir, "../configs/#{ name }")
  else
    # TODO: Recursively look for knit files in parent directories to
    # make it easy to run 'knit serve' from project subdirs.
    candidates.push (path.resolve './knit')
    candidates.push (path.resolve './.knit')

  # Find first existing module
  paths = (resolve name for name in candidates)
  paths = (p for p in paths when p?)
  resolved = paths[0]

  if not resolved
    console.error "ERROR: Could not find config file. Modules tried:"
    console.error "    #{ name }" for name in candidates
    process.exit(1)
  else
    try
      delete require.cache[resolved]
      config = require resolved
      config.FILENAME = resolved
      config
    catch err
      console.error "ERROR: Config file threw error while loading:"
      console.error "    ", err.message
      process.exit(1)
