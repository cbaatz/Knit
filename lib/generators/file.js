var content = require('../content');

var FileGenerator = function (filename, mimeType) {
    this.filename = filename;
    this.mimeType = mimeType;
};
FileGenerator.prototype.generate = function () {
    return (new content.File(this.filename, this.mimeType));
};

module.exports = FileGenerator;
