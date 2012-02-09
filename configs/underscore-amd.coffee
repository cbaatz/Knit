handle = require 'knit-common'

exports.routes = {}
arg = knit.args.shift() or 'help'
ref = arg or 'master'

filename = if knit.min then 'underscore-min.js' else 'underscore.js'

if arg == 'help' or knit.help or knit.h
  console.log "Knit resource file for Underscore retrieval"
  console.log "Usage:   knit underscore-amd REF"
  console.log "Example: knit underscore-amd 0.9.1"
  console.log "         knit underscore-amd master"
else
  exports.routes['underscore.js'] = handle.github('amdjs', 'underscore', ref, filename)
