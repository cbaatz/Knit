var defaultMimeTypes = {
  '.txt':    'text/plain',
  '.htm':    'text/html',
  '.html':   'text/html',
  '.css':    'text/css',
  '.coffee': 'text/coffeescript',
  '.js':     'application/javascript',
  '.json':   'application/json',
  '.xhtml':  'application/xhtml+xml',
  '.xml':    'application/xml',
  '.gif':    'image/gif',
  '.png':    'image/png',
  '.jpg':    'image/jpeg',
  '.jpeg':   'image/jpeg',
  '.svg':    'image/svg+xml',
  '.ico':    'image/vnd.microsoft.icon'
};

var matchMimeType = function (filename) {
    // Find matching endings and pick the longest one or return the
    // defaultType.  ts is a list of pairs, where the first item is
    // the length of the match and the second is the mimetype.
    var ts = [], extension;
    for (extension in defaultMimeTypes) {
        if ((new RegExp(extension + "$").test(filename))) {
            ts.push([extension.length, defaultMimeTypes[extension]]);
        }
    }
    ts.sort();
    if (ts.length > 0) {
        return ts.pop()[1];
    } else {
        return null;
    }
};

module.exports = function (filename, mimeType) {
    return function (stream) {
        var fileStream = require('fs').createReadStream(filename);
        fileStream.on('error', function (error) {
            console.error("Error when writing file", filename, error);
        });
        stream.setHeader('Content-Type', mimeType || matchMimeType(filename) || 'text/plain');
        fileStream.pipe(stream);
    };
};
