handle = require 'knit-common'

arg = knit.args.shift() or 'help'

if arg == 'help' or knit.help or knit.h
  console.log "Knit resource file for downloading jQuery"
  console.log "Usage:   knit jquery VERSION"
  console.log "Example: knit jquery 1.7.1"
else
  exports.routes = {}
  version = arg
  min = if knit.min then '.min' else ''
  p = "/jquery-#{ version }#{ min }.js"
  exports.routes['jquery.js'] = handle.httpget('code.jquery.com', p)
