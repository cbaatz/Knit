exports.preview = (config, loadResources) ->
  resources = loadResources()
  strings = []
  for target, [mime, _] of resources
    strings.push("    #{ target } (mimetype #{ mime })")
  if strings.length > 0
    console.log "Knit found the following targets:"
    for string in strings
      do (string) ->
        console.log string
  else
    console.log "Knit found NO targets."
  console.log "THIS WAS A PREVIEW; NOTHING WAS DONE."
