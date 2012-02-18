handle = require 'knit-common'

exports.NAME = "jQuery downloader"
exports.DESCRIPTION = ''

exports.resources = (action, knit, log) ->
  if arg == 'help' or knit.help or knit.h
    console.log "Knit resource file for downloading jQuery"
    console.log "Usage:   knit jquery VERSION"
    console.log "Example: knit jquery 1.7.1"
  else
    resources = {}
    version = arg
    min = if knit.min then '.min' else ''
    p = "/jquery-#{ version }#{ min }.js"
    resources['jquery.js'] = handle.httpget('code.jquery.com', p)
    resources
