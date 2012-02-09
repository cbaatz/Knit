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

masqueradeAsHttpResponse = (stream) ->
  stream.writeContinue = ->
  stream.writeHead = ->
  stream.statusCode = 0
  stream.setHeader = ->
  stream.getHeader = ->
  stream.removeHeader = ->
  stream.addTrailers = ->
  stream.setMime = ->
  stream.endWithMime = (d, m) -> this.end(d)
  stream

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

        # If we want to be able to control the file permissions, we
        # have two options:

        # 1. Wrap a buffer write stream around the fs write stream
        # 2. Add a method to change the permissions of the fs write
        # stream when it ends. This seems less secure.

        if config.overwrite or not (p.existsSync fullFilePath)
          res = masqueradeAsHttpResponse fs.createWriteStream(fullFilePath)
          res.on('close', () ->
            console.log "WROTE #{ fullFilePath }: #{ res.bytesWritten } bytes. DONE.")
          res.on('error', (err) ->
            console.log "ERROR: #{ err.message }")
          handler res
        else
          console.log "IGNORED #{ path }: #{ fullFilePath } exists."
