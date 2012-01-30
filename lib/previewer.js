
  exports.preview = function(config, routes) {
    var handler, path, string, strings, _i, _len;
    strings = [];
    for (path in routes) {
      handler = routes[path];
      strings.push("    " + path);
    }
    if (strings.length > 0) {
      console.log("Knit found the following targets:");
      for (_i = 0, _len = strings.length; _i < _len; _i++) {
        string = strings[_i];
        console.log(string);
      }
    } else {
      console.log("Knit found NO targets.");
    }
    return console.log("THIS WAS A PREVIEW; NOTHING WAS DONE.");
  };
