fs         = require 'fs'
p          = require 'path'
flatten    = require './flatten'
knitstream = require './knitstream'

ensureDirs = (path, log) ->
  # Ensure path exists; that is, create dirs that don't exists.
  dirs = p.relative('/', p.resolve(path)).split('/')
  previous = '/'
  for dir in dirs
    do (dir) ->
      current = p.join previous, dir
      if not fs.existsSync(current)
        fs.mkdirSync(current)
        log.info "Created directory '#{ dir }' in #{ previous }"
      previous = current

exports.write = (module, action, knit, log, cwd) ->
  config           = (module?.writer or -> {})(action, knit, log)
  config.root      ?= '.'   # What folder should we write to?
  config.overwrite ?= false # Should we replace existing files?
  config.makeDirs  ?= true  # Create intermediate dirs if they don't
                            # exist?
  buildDir         =  p.resolve cwd, config.root

  log.debug "Writer output directory (relative): #{ config.root }"
  log.debug "Writer output directory (absolute): #{ buildDir }"

  for path, handler of flatten.module(module, action, knit, log)
    do (path, handler) ->
      fullFilePath = p.join buildDir, path

      basename = p.basename path
      if (basename == '') or /\/$/.test(basename)
        # Path points to a directory
        log.warn "IGNORED #{ path }: can't write to a directory."
      else
        if config.makeDirs then ensureDirs p.dirname(fullFilePath), log

        # If we want to be able to control the file permissions, we
        # have two options:
        # 1. Wrap a buffer write stream around the fs write stream
        # 2. Add a method to change the permissions of the fs write
        # stream when it ends. This seems less secure.

        if config.overwrite or not (fs.existsSync fullFilePath)
          res = knitstream.fromWriteStream fs.createWriteStream(fullFilePath)
          res.on('close', () ->
            log.info "WROTE #{ fullFilePath }: #{ res.bytesWritten } bytes.")
          res.on('error', (err) ->
            log.error "#{ err.message }")
          handler res
        else
          log.warn "IGNORED #{ path }: #{ fullFilePath } exists."
