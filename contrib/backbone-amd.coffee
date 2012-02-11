handle = require 'knit-common'

arg = knit.args.shift() or 'help'

if arg == 'help' or knit.help or knit.h
  console.log "Knit resource file for downloading the AMD Backbone fork."
  console.log "Usage:   knit backbone-amd REF"
  console.log "Example: knit backbone-amd 0.9.1"
  console.log "         knit backbone-amd master"
else
  exports.routes = {}
  ref = arg or 'master'
  filename = if knit.min then 'backbone-min.js' else 'backbone.js'
  exports.routes['backbone.js'] = handle.github('amdjs', 'backbone', ref, filename)
