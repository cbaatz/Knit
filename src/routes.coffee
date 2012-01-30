p = require 'path'

listRoutes = (routes) ->
  # Transform nested routes objects to a flat list of routes/handler
  # pairs.
  list = []
  # Loop over routes
  for route, handlerOrRoutes of routes
    do (route, handlerOrRoutes) ->
      if typeof(handlerOrRoutes) == 'function'
        # Route is associated with handler so not nested
        list.push [route, handlerOrRoutes]
      else if typeof(handlerOrRoutes) == 'object'
        # Route is associated with object so assume nested.
        # Recurisvely get list of route/handler pairs and join paths
        # before adding to flat list of routes.
        list.push [p.join(route, r), h] for [r, h] in listRoutes handlerOrRoutes
  list

exports.flatten = (routes) ->
  flatRoutes = {}
  flatRoutes[route] = handler for [route, handler] in listRoutes routes
  flatRoutes
