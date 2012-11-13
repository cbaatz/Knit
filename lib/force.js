var streamBuffers = require('stream-buffers'),
    extendStream = require('./extend-stream');

module.exports = function (generator, callback) {
    var stream = extendStream(new streamBuffers.WritableStreamBuffer({
        initialSize: (100 * 1024),
        incrementAmount: (100 * 1024)
    }));
    stream.on('close', function () {
        var buffer = stream.getContents();
        buffer.headers = stream.headers || {};
        buffer.headers['Content-Length'] = buffer.length;
        callback(undefined, buffer);
    });
    stream.on('error', function (error) {
        var buffer = stream.getContents();
        buffer.headers = stream.headers || {};
        buffer.headers['Content-Length'] = buffer.length;
        callback(error, buffer);
    });
    generator(stream); // Write to buffer stream
};
