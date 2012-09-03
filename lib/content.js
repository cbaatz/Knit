var fs = require('fs');

var Content = function (options) {
    this.config = {};
};

Content.prototype.toString = function () {
};

var FileContent = function (filename) {
    Content.call(this);
    this.filename(filename);
};
FileContent.prototype = new Content();
FileContent.prototype.toString = function () {
    return fs.readFileSync(this.config.filename).toString();
};
FileContent.prototype.filename = function (filename) {
    if (filename !== undefined) {
        this.config.filename = filename;
        return this;
    } else {
        return this.config.filename;
    }
};

var StringContent = function () { Content.call(this); };
StringContent.prototype = new Content();
var StreamContent = function () { Content.call(this); };
StreamContent.prototype = new Content();

exports.Content = Content;
exports.File = FileContent;
exports.String = StringContent;
exports.Stream = StreamContent;
