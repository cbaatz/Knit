var mime = require('mime'),
    fs = require('fs');

module.exports = function (filename, mimeType) {
    return function (stream) {
        var fileStream = fs.createReadStream(filename, {
            bufferSize: 64 * 1024
        });
        fileStream.on('error', function (error) {
            console.error("Error when reading file", filename, error);
        });
        stream.setHeader('Content-Type', mimeType || mime.lookup(filename));
        fileStream.pipe(stream);
    };
};
