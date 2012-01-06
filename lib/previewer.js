
  exports.preview = function(config, loadResources) {
    var mime, resources, string, strings, target, _, _fn, _i, _len, _ref;
    resources = loadResources();
    strings = [];
    for (target in resources) {
      _ref = resources[target], mime = _ref[0], _ = _ref[1];
      strings.push("    " + target + " (mimetype " + mime + ")");
    }
    if (strings.length > 0) {
      console.log("Knit found the following targets:");
      _fn = function(string) {
        return console.log(string);
      };
      for (_i = 0, _len = strings.length; _i < _len; _i++) {
        string = strings[_i];
        _fn(string);
      }
    } else {
      console.log("Knit found NO targets.");
    }
    return console.log("THIS WAS A PREVIEW; NOTHING WAS DONE.");
  };
