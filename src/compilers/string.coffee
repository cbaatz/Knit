exports.getResources = (targetPath, root, source, config) ->
  compile = (messenger) ->
    messenger(source)

  result = {}
  result[targetPath] = ['text/plain', compile]
  result
