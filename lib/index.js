var http = require('http'),
    https = require('https'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    crypto = require('crypto'),
    streamBuffers = require('stream-buffers'),
    async = require('async'),
    Tree = require('./structures/tree'),
    Files = require('./structures/files');
    var all = {};

// TODO: Clean up and organise the code here into modules/files.
// TODO: Expose more generic tree map/reduce functions that we can use
// to write file-loaders and asset-tree flatteners.

exports.tree = function (config) {
    return new Tree(config);
};

exports.files = function (config) {
    return new Files(config);
};

// TODO: Create a uniform way of testing if a structure is a structure
// (also in tree).
var ensureResources = function (resourcesOrStructure) {
    if (resourcesOrStructure.build instanceof Function) {
        return resourcesOrStructure.build();
    } else {
        return resourcesOrStructure;
    }
};

// TODO: We should create an abstract stream that just allows writing
// and header setting and provide wrappers for other streams.
var extendFilestream = function (filestream) {
    // This extends a filestream such that it can be used as a
    // response stream, giving appropriate errors.
    filestream.headers = filestream.headers || {};
    filestream.writeContinue = function () {};
    filestream.writeHead = function (statusCode, reasonPhrase, headers) {};
    filestream.statusCode = 0;
    filestream.sendDate = false;
    filestream.setHeader = function (name, value) {
        this.headers[name.toString().toLowerCase()] = value.toString();
    };
    filestream.getHeader = function (name) {
        return this.headers[name.toString().toLowerCase()];
    };
    filestream.removeHeader = function (name) {
        delete this.headers[name.toString().toLowerCase()];
    };
    filestream.addTrailers = function (headers) {};
    return filestream;
};

var ensureDirsSync = function (pathname, log) {
    // Ensure pathname exists; that is, create dirs that don't exists.
    var dirs, previous, i, current;
    if (!fs.existsSync(pathname)) {
        dirs = path.resolve(pathname).split('/');
        previous = '/';
        for (i = 0; i < dirs.length; i++) {
            current = path.join(previous, dirs[i]);
            if (!fs.existsSync(current)) {
                fs.mkdirSync(current);
                console.log("CREATED directory", dirs[i], "in",  previous);
            }
            previous = current;
        }
    }
};

exports.write = function (resourcesOrStructure, buildpath, config) {
    // TODO: Use async library here.
    // We do not handle folder resources here, assume resources are
    // all valid files.

    var resources = ensureResources(resourcesOrStructure),
        maxThreads = 16, hrefs = [], errors = [], href, i;

    config = config || {};
    config.context = config.context || {};
    if (typeof config.overwrite !== 'boolean') config.overwrite = false;
    buildpath = path.resolve(buildpath || './dist'); // Make absolute

    console.log("Writing to", buildpath);

    function write (filename, generator, context) {
        // We do nothing if filename or generator is falsy to simplify
        // recursive call code.
        if (!(filename && generator)) return;

        var stream;

        if (config.overwrite || !fs.existsSync(filename)) {
            ensureDirsSync(path.dirname(filename));
            stream = extendFilestream(fs.createWriteStream(filename, {
                mode: generator.mode,
                bufferSize: 64 * 1024
            }));
            stream.on('close', function () {
                console.log("WROTE", filename, "(" + stream.bytesWritten, "bytes)");
                write.apply(null, hrefs.pop()); // Reuse this "thread"
            });
            stream.on('error', function (error) {
                console.error("Could not write", filename, error.message);
                errors.push(filename + ": " + error.message);
            });
            generator(stream, context);
        } else {
            console.warn("SKIPPED", filename, "already exists.");
        }
    };

    // Build up list of [filename, generator] to write, then start
    // maxThread "threads" to write these.
    for (href in resources) hrefs.push([path.join(buildpath, href),
                                        resources[href],
                                        config.context
                                       ]);
    for (i = 0; i < maxThreads; i++) write.apply(null, hrefs.pop());
    return errors;
};

// TODO: Expose this
function force (task, callback) {
    var stream = new streamBuffers.WritableStreamBuffer({
        initialSize: (100 * 1024),
        incrementAmount: (100 * 1024)
    });
    stream.on('close', function () {
        var buffer = stream.getContents();
        buffer.headers = stream.headers || {};
        buffer.headers['Content-Length'] = buffer.length;
        callback(undefined, buffer, task);
    });
    stream.on('error', function (error) {
        var buffer = stream.getContents();
        buffer.headers = stream.headers || {};
        buffer.headers['Content-Length'] = buffer.length;
        callback(error, buffer, task);
    });
    task.generator(extendFilestream(stream)); // Write to buffer stream
};

// TODO: Move this out
function put (task, callback) {
    if (!callback) console.log("CALLBACK", callback);
    var options = url.parse(task.href), request, req;
    options.method = 'PUT';
    options.headers = task.buffer.headers || {};
    options.headers['Expect'] = '100-continue';

    request = (options.protocol === 'https:') ? https.request : http.request;

    req = request(options, function (res) {
        res.on('data', function (chunk) {});
        res.on('end', function () {
            switch (res.statusCode) {
            case 307:
                // Put to given location and reset retries
                task.href = res.headers['location'];
                task.retries = 0;
                put(task, callback);
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
                    put(task, callback);
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
    console.log("HEADERS", req.getHeader('x-awz-acl'));
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
            put(task, callback);
        } else {
            callback({
                type: error.code,
                message: error.message,
                pathname: task.pathname
            }, task);
        }
    });

    req.write(''); // Send headers
};

exports.upload = function (resourcesOrStructure, config, callback) {
    // To upload, we first force the generator into a buffer, then PUT
    // that buffer to the given URL.

    config = config || {};

    var resources = ensureResources(resourcesOrStructure),
        href = config.href,
        errors = [], pathname, i = 0,
        forceQueue, forceConcurrency = 10,
        putQueue, putConcurrency = 25;

    // put task = { pathname, href, buffer, retries, maxRetries }
    putQueue = async.queue(put, putConcurrency);
    putQueue.drain = function () {
        console.log("NOTHING MORE TO PUT.");
        callback(errors.length > 0 ? errors : undefined);
    };

    // force task = { pathname, generator }
    forceQueue = async.queue(force, forceConcurrency);
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

exports.createServer = function (resourcesOrStructure) {
    var resources = ensureResources(resourcesOrStructure);
    return http.createServer(function (req, res) {
        var generator = resources[url.parse(req.url).pathname];
        if (generator) {
            // TODO: Logging?
            generator(res);
        } else {
            res.writeHead(404, "NOT FOUND");
            res.end();
        }
    });
};
