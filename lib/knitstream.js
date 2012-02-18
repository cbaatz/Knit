
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
    return s;
  };
