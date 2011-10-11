fs = require 'fs'
p = require 'path'

exports.build = (root, resources) ->
  # TODO: If target is not a folder of if it doesn't exist, error create
  for path, [mimeType, compile] of resources
    compile (data) ->
      fullPath = p.join root, path
      fs.writeFileSync fullPath, data
      size = data.length
      console.log "Wrote #{ fullPath }: #{ size } bytes. DONE."

