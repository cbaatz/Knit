exports.preview = (config, routes) ->
  strings = []
  for path, handler of routes
    # TODO: Display mime-type and other meta info?
    strings.push "    #{ path }"

  if strings.length > 0
    console.log "Knit found the following targets:"
    console.log string for string in strings
  else
    console.log "Knit found NO targets."
  console.log "THIS WAS A PREVIEW; NOTHING WAS DONE."
