/*globals console*/
var http = require('http'),
    https = require('https'),
    url = require('url'),
    async = require('async'),
    ensureResources = require('./utils').ensureResources,
    force = require('./force');

function doForce (task, callback) {
    "use strict";
    force(task.generator, function (error, buffer) {
        callback(error, buffer, task);
    });
}

function doPut (task, callback) {
    "use strict";
    if (!callback) console.log("CALLBACK", callback);
    var options = url.parse(task.href), request, req;
    options.method = 'PUT';
    options.headers = task.buffer.headers || {};
    options.headers.Expect = '100-continue';

    request = (options.protocol === 'https:') ? https.request : http.request;

    req = request(options, function (res) {
        res.on('data', function (chunk) {});
        res.on('end', function () {
            switch (res.statusCode) {
            case 307:
                // Put to given location and reset retries
                task.href = res.headers.location;
                task.retries = 0;
                doPut(task, callback);
                break;
            case 200:
                callback(undefined, task);
                break;
            default:
                if (task.retries < task.maxRetries) {
                    console.warn(
                        "RETRY", task.pathname, task.retries + "/" + task.maxRetries
                    );
                    task.retries++;
                    doPut(task, callback);
                } else {
                    callback({
                        type: res.statusCode,
                        message: 'Failed after maximum retries.',
                        pathname: task.pathname
                    }, task);
                }
            }
        });
    });

    // Abort if we time out. This will close and error. Don't think we
    // need this if the server behaves and it results in some event
    // emitter warning.
    //
    // req.setTimeout(3000, function () { req.abort(); });

    req.on('continue', function () {
        req.setTimeout(0); // Got continue, don't time out now.
        req.end(task.buffer);
    });

    req.on('error', function (error) {
        if (task.retries < task.maxRetries) {
            task.retries++;
            console.warn(
                "RETRY", task.pathname, task.retries + "/" + task.maxRetries,
                error.code, error.message);
            doPut(task, callback);
        } else {
            callback({
                type: error.code,
                message: error.message,
                pathname: task.pathname
            }, task);
        }
    });

    req.write(''); // Send headers
}

exports = function (resourcesOrStructure, config, callback) {
    "use strict";
    // To upload, we first force the generator into a buffer, then PUT
    // that buffer to the given URL.

    config = config || {};

    var resources = ensureResources(resourcesOrStructure),
        href = config.href,
        errors = [], pathname, i = 0,
        forceQueue, forceConcurrency = 10,
        putQueue, putConcurrency = 25;

    // put task = { pathname, href, buffer, retries, maxRetries }
    putQueue = async.queue(doPut, putConcurrency);
    putQueue.drain = function () {
        console.log("NOTHING MORE TO PUT.");
        callback(errors.length > 0 ? errors : undefined);
    };

    // force task = { pathname, generator }
    forceQueue = async.queue(doForce, forceConcurrency);
    forceQueue.drain = function () { console.log("NOTHING MORE TO FORCE."); };

    var putCallback = function (error, task) {
        i++;
        if (error) {
            console.error(i.toString(), "FAILED PUT", task.pathname);
            errors.push(error);
        } else {
            console.error(i.toString(), "SUCCEEDED PUT",
                          task.href.split('?', 1)[0],
                          task.buffer.length, "bytes");
        }
    };

    var forcedCallback = function (error, buffer, task) {
        var header;
        if (error) {
            console.error("FAILED FORCING", task.pathname, "ABORTING.");
            callback(error);
        } else {
            // TODO: Here we could in theory get the md5 sum and do a
            // HEAD request to Amazon to see if we need to update.
            for (header in config.headers)
                buffer.headers[header] = config.headers[header];
            console.log("FORCED", task.pathname, buffer.length, "bytes");
            putQueue.push({
                pathname: task.pathname,
                href: href + task.pathname,
                buffer: buffer,
                retries: 0,
                maxRetries: 3
            }, putCallback);
        }
    };

    for (pathname in resources)
        forceQueue.push({ pathname: pathname,
                          generator: resources[pathname] }, forcedCallback);
};
