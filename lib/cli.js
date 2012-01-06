(function() {
  var path;

  path = require('path');

  exports.parse = function(args) {
    var arg, m, name, params, positionals, program, val, _i, _len;
    program = args.shift();
    params = {};
    positionals = [];
    for (_i = 0, _len = args.length; _i < _len; _i++) {
      arg = args[_i];
      if (m = arg.match(/^--([\w-]+)(=(.+))?$/)) {
        val = m[3];
        name = m[1];
        if (!(val != null) && (m = name.match(/^no-([\w-]+)$/))) {
          name = m[1];
          val = false;
        }
        params[name] = val != null ? val : true;
      } else if (m = arg.match(/^-(\w)(=(.+))?$/)) {
        val = m[3];
        name = m[1];
        params[name] = val != null ? val : true;
      } else {
        positionals.push(arg);
      }
    }
    return [program, params, positionals];
  };

}).call(this);
