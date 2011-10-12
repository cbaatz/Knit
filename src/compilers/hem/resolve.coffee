Module = require('module')
{join, extname, dirname, basename, resolve} = require('path')

isAbsolute = (path) -> /^\//.test(path)

# Normalize paths and remove extensions
# to create valid CommonJS module names
modulerize = (id, filename = id) ->
  ext = extname(filename)
  join(dirname(id), basename(id, ext))

modulePaths = Module._nodeModulePaths(process.cwd())

invalidDirs = ['/', '.']

repl =
  id: 'repl'
  filename: join(process.cwd(), 'repl')
  paths: modulePaths

# Resolves a `require()` call. Pass in the name of the module where
# the call was made, and the path that was required.
# Returns an array of: [moduleName, scriptPath]
module.exports = (request, parent = repl) ->
  [_, paths]  = Module._resolveLookupPaths(request, parent)
  filename    = Module._findPath(request, paths)
  dir         = filename

  if not filename
    try
      m = require request
    catch err
      console.log "Cannot find module: #{request}. Have you run `npm install .` ?"
      throw "Cannot find module: #{request}. Have you run `npm install .` ?"
    console.log "Module '#{ request }' looks like a core NodeJS module; these are not supported."
    throw "Module '#{ request }' looks like a core NodeJS module; these are not supported."

  # Find package root relative to localModules folder
  while dir not in invalidDirs and dir not in modulePaths
    dir = dirname(dir)

  try
    throw("Load path not found for #{filename}") if dir in invalidDirs
  catch err
    console.log err
    throw err

  id = filename.replace("#{dir}/", '')

  [modulerize(id, filename), filename]

module.exports.paths = (filename) ->
  Module._nodeModulePaths(dirname(filename))

module.exports.modulerize = modulerize