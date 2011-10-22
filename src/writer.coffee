fs = require 'fs'
p = require 'path'

exports.write = (config, loadResources) ->
  config       ?= {}
  config?.root ?= '.'
  console.log "Writing targets to filesystem..."
  for path, [mimeType, compile] of loadResources()
    do (path, compile) ->
      fullPath = p.resolve p.join(config.root, path.replace(/^\//, ''))
      compile (data) ->
        # TODO: If target is not a folder of if it doesn't exist, error create
        fs.writeFileSync fullPath, data
        size = data.length
        console.log "Wrote #{ fullPath }: #{ size } bytes. DONE."
