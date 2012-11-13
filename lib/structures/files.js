var path = require('path'),
    fs = require('fs'),
    file = require('../factories/file');

var Files = function (pathname) {
    this.pathname = path.resolve(pathname || '.');
};

var buildFileTree = function (pathname, relativename) {
    // Return map from path to filecontent generator
    var flat = {}, mimeType, generator, stat, i, files;
    if (!fs.existsSync(pathname)) {
        console.warn(pathname, "does not exist. IGNORING.");
    } else {
        stat = fs.statSync(pathname);
        if (stat.isDirectory()) {
            files = fs.readdirSync(pathname);
            for (i = 0; i < files.length; i++) {
                (function (pathname, relativename, filename) {
                    var subFlat, name;
                    pathname = path.join(pathname, filename);
                    relativename = path.join(relativename, filename);
                    // Need to check for some odd links
                    if (fs.existsSync(pathname)) {
                        // Recurse and copy to this flat structure
                        subFlat = buildFileTree(pathname, relativename);
                        for (name in subFlat) flat[name] = subFlat[name];
                    }
                })(pathname, relativename, files[i]);
            }
        } else if (stat.isFile()) {
            flat[relativename] = file(pathname);
        } else {
            console.error(pathname, "is neither a directory nor a file. IGNORING.");
        }
    }
    return flat;
};

Files.prototype.build = function () {
    return buildFileTree(this.pathname, '/');
};

module.exports = Files;
