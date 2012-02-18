handle = require 'knit-common'

user = 'jakesgordon'
repo = 'javascript-state-machine'

exports.NAME = "JavaScript state machine downloader"
exports.DESCRIPTION = ''

exports.resources = (action, knit, log) ->
  filename = if knit.min then 'state-machine.min.js' else 'state-machine.js'
  ref = knit.args.shift()
  if not ref or knit.help or knit.h
    console.log "Knit resource file for downloading the JavaScript State Machine library."
    console.info "Usage:   knit state-machine REF [--min]"
    console.info "Example: knit state-machine 2.1.0"
    console.info "         knit state-machine master --min"
    console.info "Options: --min flag downloads the minified version"
  else
    targetname = knit.output or knit.o or 'state-machine.js'
    { "/#{ targetname }": handle.github(user, repo, ref, filename) }
