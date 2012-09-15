var fs = require('fs');

var Content = function (options) {
    this.config = {};
};

Content.prototype.toString = function () {
};

var FileContent = function (filename, mimeType) {
    Content.call(this);
    this.filename(filename);
    this.mimeType(mimeType);
};
FileContent.prototype = new Content();
FileContent.prototype.toString = function () {
    return fs.readFileSync(this.config.filename).toString();
};
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
            ts.push([extension.length, defaultMimeTypes]);
        }
    }
    ts.sort();
    if (ts.length > 0) {
        return ts.pop()[1];
    } else {
        return null;
    }
};
FileContent.prototype.filename = function (filename) {
    if (filename !== undefined) {
        this.config.filename = filename;
        this.config.mimeType = this.config.mimeType || matchMimeType(filename) || 'text/plain';
        return this;
    } else {
        return this.config.filename;
    }
};
FileContent.prototype.mimeType = function (mimeType) {
    if (mimeType !== undefined) {
        this.config.mimeType = mimeType;
        return this;
    } else {
        return this.config.mimeType;
    }
};
FileContent.prototype.writeTo = function (filename, callback) {
    var writeStream = fs.createWriteStream(filename);
    writeStream.on('close', callback);
    fs.createReadStream(this.config.filename,{
        'bufferSize': 4 * 1024
    }).pipe(writeStream);
;};


var StringContent = function (string, options) {
    Content.call(this, options);
    this.string = string;
};
StringContent.prototype = new Content();
StringContent.prototype.toString = function () {
    return this.string;
};

var StreamContent = function () { Content.call(this); };
StreamContent.prototype = new Content();

exports.Content = Content;
exports.File = FileContent;
exports.String = StringContent;
exports.Stream = StreamContent;
