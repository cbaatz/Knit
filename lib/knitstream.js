(function() {
  var log;

  log = require('./log');

  exports.fromWriteStream = function(s) {
    s.writeContinue = function() {};
    s.writeHead = function() {};
    s.statusCode = 0;
    s.setHeader = function() {};
    s.getHeader = function() {};
    s.removeHeader = function() {};
    s.addTrailers = function() {};
    s.setMime = function() {};
    s.endWithMime = function(d, m) {
      return this.end(d);
    };
    s.log = log;
    return s;
  };

  exports.fromHTTPResponse = function(s) {
    s.setMime = function(mime) {
      return this.setHeader('Content-Type', mime);
    };
    s.endWithMime = function(data, mime) {
      this.setHeader('Content-Type', mime);
      return this.end(data);
    };
    s.log = log;
    return s;
  };

}).call(this);
