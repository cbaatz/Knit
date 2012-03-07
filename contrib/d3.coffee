handle = require 'knit-common'

exports.NAME = "D3 downloader"
exports.DESCRIPTION = ''

exports.resources = (action, knit, log) ->
  arg = knit.args.shift() or 'help'
  if arg == 'help' or knit.help or knit.h
    console.log "Knit resource file for downloading the D3 visualisation library."
    console.log "Usage:   knit d3 REF"
    console.log "Example: knit d3 2.8.1"
    console.log "         knit d3 master"
  else
    resources = {}
    ref = arg or 'master'
    filename = if knit.min then 'd3.v2.min.js' else 'd3.v2.js'
    resources['d3.js'] = handle.github('mbostock', 'd3', ref, filename)
    resources
