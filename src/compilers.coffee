fs = require 'fs'
p = require 'path'

getResources = (target, root, source, config) ->
  root = fs.realpathSync source
  knitPath = p.join root, "_knit"
  knitSpec = require knitPath

  configClone = {}
  (configClone[k] = v) for k, v of config
  (configClone[k] = v) for k, v of knitSpec.config

  resources = {}
  for subtarget, [source, type] of knitSpec.targets
    compile = compilers[type]
    resources[p.join target, k] = v for k, v of compile subtarget, root, source, configClone
  resources

compilers =
  knit: getResources
  less: require('./compilers/less').getResources
  coffee: require('./compilers/coffee').getResources
  string: require('./compilers/string').getResources
  file: require('./compilers/file').getResources
  jade: require('./compilers/jade').getResources

module.exports = compilers
