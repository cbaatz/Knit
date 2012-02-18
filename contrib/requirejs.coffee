handle = require 'knit-common'

exports.NAME = "RequireJS downloader"
exports.DESCRIPTION = ''

exports.resources = (action, knit, log) ->
  resources = {}
  arg = knit.args.shift() or 'help'
  ref = arg or 'master'

  # Hardcoded master for CoffeeScript plugin since different repo
  plugins =
    'domReady': ['jrburke', 'requirejs', ref, 'domReady.js']
    'order':    ['jrburke', 'requirejs', ref, 'order.js']
    'text':     ['jrburke', 'requirejs', ref, 'text.js']
    'i18n':     ['jrburke', 'requirejs', ref, 'i18n.js']
    'cs':       ['jrburke', 'require-cs', 'master', 'cs.js']

  if arg == 'help' or knit.help or knit.h
    console.log "Knit resource file for downloading RequireJS"
    console.log "Usage:   knit requirejs REF [PLUGINS]"
    console.log "Example: knit requirejs 1.0.4 text domReady"
    console.log "         knit requirejs master"
    console.log "Known plugins are:"
    console.log "         #{ plugin }" for plugin of plugins
  else
    resources['require.js'] = handle.github('jrburke', 'requirejs', ref, 'require.js')
    # Download plugins if any specified
    for arg in knit.args
      do (arg) ->
        if plugins[arg]
          [user, repo, ref, file] = plugins[arg]
          resources[file] = handle.github(user, repo, ref, file)
          if arg == 'cs'
            knit.log.warn "CoffeScript plugin hardcoded to 'master' version."
        else
          knit.log.error "'#{ arg }' plugin not known."
    resources
