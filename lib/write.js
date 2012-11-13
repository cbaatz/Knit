var path = require('path'),
    fs = require('fs'),
    async = require('async'),
    extendStream = require('./extend-stream'),
    utils = require('./utils');

module.exports = function (resourcesOrStructure, config, callback) {
    // We do not handle folder resources here, assume resources are
    // all valid files.

    var resources = utils.ensureResources(resourcesOrStructure),
        i = 0, writeConcurrency = 16, errors = [], href, writeQueue;

    config = config || {};
    config.context = config.context || {};
    if (typeof config.overwrite !== 'boolean') config.overwrite = false;
    config.buildpath = path.resolve(config.buildpath || './dist'); // Make absolute

    console.log("Writing to", config.buildpath);

    function doWrite (task, callback) {
        var pathname = task.pathname,
            generator = task.generator,
            context = task.context;

        var stream;

        if (config.overwrite || !fs.existsSync(pathname)) {
            utils.ensureDirsSync(path.dirname(pathname));
            stream = extendStream(fs.createWriteStream(pathname, {
                mode: generator.mode,
                bufferSize: 64 * 1024
            }));
            stream.on('close', function () {
                callback(undefined, task);
            });
            stream.on('error', function (error) {
                callback(error.message, task);
            });
            generator(stream, context);
        } else {
            callback("ALREADY EXISTS", task);
        }
    };

    function writeCallback (error, task) {
        i++;
        if (error) {
            console.error(i.toString(), "FAILED WRITE", task.pathname);
            errors.push(error);
        } else {
            console.error(i.toString(), "WROTE",
                          task.href.split('?', 1)[0],
                          task.buffer.length, "bytes");
        }
    };

    // write task = { pathname, generator, context }
    writeQueue = async.queue(doWrite, writeConcurrency);
    writeQueue.drain = function () {
        callback(errors.length > 0 ? errors : undefined);
    };

    for (href in resources)
        writeQueue.push({
            pathname: path.join(config.buildpath, href),
            generator: resources[href],
            context: config.context
        }, writeCallback);
};
