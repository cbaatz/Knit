module.exports = function (string, mimeType) {
    mimeType = mimeType || 'text/plain';

    return function (stream) {
        stream.setHeader('Content-Type', mimeType);
        stream.end(string, 'utf8');
    };
};
