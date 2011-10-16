path = require 'path'

exports.parse = (args) ->
  program = args.shift()
  params = {}
  positionals = []

  for arg in args
    if m = arg.match(/^--([\w-]+)(=(.+))?$/)
      val = m[3]
      name = m[1]
      if not val? and m = name.match(/^no-([\w-]+)$/)
        # Allow for --no-something switches
        name = m[1]
        val = false
      params[name] = val ? true
    else if m = arg.match(/^-(\w)(=(.+))?$/)
      val = m[3]
      name = m[1]
      params[name] = val ? true
    else
      positionals.push(arg)
  [program, params, positionals]
