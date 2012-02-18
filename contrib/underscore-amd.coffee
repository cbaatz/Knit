handle = require 'knit-common'

exports.NAME = "Underscore AMD version downloader"
exports.DESCRIPTION = ''

exports.resources = (action, knit, log) ->
  arg = knit.args.shift() or 'help'
  ref = arg or 'master'
  filename = if knit.min then 'underscore-min.js' else 'underscore.js'
  if arg == 'help' or knit.help or knit.h
    console.log "Knit resource file for downloading the Underscore AMD fork."
    console.log "Usage:   knit underscore-amd REF"
    console.log "Example: knit underscore-amd 0.9.1"
    console.log "         knit underscore-amd master"
  else
    { 'underscore.js': handle.github('amdjs', 'underscore', ref, filename) }
