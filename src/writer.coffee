fs = require 'fs'
p = require 'path'

ensureDirs = (path) ->
  # Ensure path exists; that is, create dirs that don't exists.
  dirs = p.relative('/', p.resolve(path)).split('/')
  previous = '/'
  for dir in dirs
    do (dir) ->
      current = p.join previous, dir
      if not p.existsSync(current)
        fs.mkdirSync(current)
        console.log "CREATED #{ dir } directory in #{ previous }"
      previous = current

exports.write = (config, routes) ->

  config ?= {}
  config.root ?= '.' # What folder should we write to?
  config.overwrite ?= false # Should we replace existing files?
  config.makeDirs ?= true # Create intermediate dirs if they don't
                          # exist?

  buildDir = p.join (p.resolve config.root), '/'

  console.log "Writing resources to #{ config.root } (#{ buildDir })..."

  for path, handler of routes
    do (path, handler) ->
      fullFilePath = p.join buildDir, path

      basename = p.basename path
      if (basename == '') or /\/$/.test(basename)
        # Path points to a directory
        console.log "IGNORED #{ path }: Can't write to a directory."
      else
        if config.makeDirs
          ensureDirs (p.dirname fullFilePath)

        handler (data, mimeType) ->
          if config.overwrite or not (p.existsSync fullFilePath)
            fs.writeFile fullFilePath, data, 'utf8', (err) ->
              if err
                console.log "ERROR: #{ err.message }"
              else
                size = data.length
                console.log "WROTE #{ fullFilePath }: #{ size } bytes. DONE."
          else
            console.log "IGNORED #{ path }: #{ fullFilePath } exists."
