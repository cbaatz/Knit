var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    Tree = require('./structures/tree'),
    Files = require('./structures/files');

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

var extendFilestream = function (filestream) {
    // This extends a filestream such that it can be used as a
    // response stream, giving appropriate errors.
    filestream.writeContinue = function () {};
    filestream.writeHead = function (statusCode, reasonPhrase, headers) {};
    filestream.statusCode = 0;
    filestream.setHeader = function (name, value) {};
    filestream.sendDate = false;
    filestream.getHeader = function (name) { return undefined; };
    filestream.removeHeader = function (name) {};
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
    // We do not handle folder resources here, assume resources are
    // all valid files.

    var resources = ensureResources(resourcesOrStructure),
        maxThreads = 16, urls = [], url, i;

    config = config || {};
    if (typeof config.overwrite !== 'boolean') config.overwrite = false;
    buildpath = path.resolve(buildpath || './dist'); // Make absolute

    console.log("Writing to", buildpath);

    function write (filename, generator) {
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
                write.apply(null, urls.pop()); // Reuse this "thread"
            });
            stream.on('error', function (error) {
                console.error("Could not write", filename, error.message);
            });
            generator(stream);
        } else {
            console.warn("SKIPPED", filename, "already exists.");
        }
    };

    // Build up list of [filename, generator] to write, then start
    // maxThread "threads" to write these.
    for (url in resources) urls.push([path.join(buildpath, url), resources[url]]);
    for (i = 0; i < maxThreads; i++) write.apply(null, urls.pop());
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
