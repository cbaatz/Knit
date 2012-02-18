p = require 'path'

listResources = (resources) ->
  # Transform nested resources objects to a flat list of resources/handler
  # pairs.
  list = []
  # Loop over resources
  for resource, handlerOrResources of resources
    do (resource, handlerOrResources) ->
      if typeof(handlerOrResources) == 'function'
        # Resource is associated with handler so not nested
        list.push [resource, handlerOrResources]
      else if handlerOrResources instanceof Array
        for hor in handlerOrResources
          do (hor) ->
            list.push [p.join(resource, r), h] for [r, h] in listResources hor
      else if typeof(handlerOrResources) == 'object'
        # Resource is associated with object so assume nested.
        # Recurisvely get list of resource/handler pairs and join paths
        # before adding to flat list of resources.
        list.push [p.join(resource, r), h] for [r, h] in listResources handlerOrResources
  list

exports.flatten = (resources) ->
  flatResources = {}
  flatResources[resource] = handler for [resource, handler] in listResources resources
  flatResources

exports.module = (module, action, knit, log) ->
  if (typeof module.resources) == 'function'
    exports.flatten module.resources(action, knit, log)
  else
    exports.flatten module.resources
