
  exports.getResources = function(targetPath, root, source, config) {
    var compile, result;
    compile = function(messenger) {
      return messenger(source);
    };
    result = {};
    result[targetPath] = ['text/plain', compile];
    return result;
  };
