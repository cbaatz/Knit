fs = require 'fs'
p = require 'path'
{loadConfig} = require './config'

getResources = (target, root, source, config) ->
  root = fs.realpathSync p.join(root, source)
  config = loadConfig root, config
  resources = {}
  for subtarget, [source, type] of config.targets
    compile = compilers[type]
    resources[p.join target, k] = v for k, v of compile subtarget, root, source, config
  resources

compilers =
  knit: getResources
  r: require('./compilers/r').getResources
  file: require('./compilers/file').getResources
  string: require('./compilers/string').getResources
  less: require('./compilers/less').getResources
  html: require('./compilers/html').getResources
  jade: require('./compilers/jade').getResources
  coffee: require('./compilers/coffee').getResources

module.exports = compilers
