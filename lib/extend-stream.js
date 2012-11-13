// TODO: Replace functions conditionally (if they don't already exist)
// and then we can wrap all streams in this safely.

module.exports = function (stream) {
    // This extends a stream such that it can be used as a
    // response stream, giving appropriate errors.
    stream.headers = stream.headers || {};
    stream.writeContinue = function () {};
    stream.writeHead = function (statusCode, reasonPhrase, headers) {};
    stream.statusCode = 0;
    stream.sendDate = false;
    stream.setHeader = function (name, value) {
        this.headers[name.toString().toLowerCase()] = value.toString();
    };
    stream.getHeader = function (name) {
        return this.headers[name.toString().toLowerCase()];
    };
    stream.removeHeader = function (name) {
        delete this.headers[name.toString().toLowerCase()];
    };
    stream.addTrailers = function (headers) {};
    return stream;
};

