var path = require('path'),
    fs = require('fs'),
    fileGenerator = require('../generators/file');

var Files = function (pathname) {
    this.pathname = pathname || '.';
};

var buildFileTree = function (pathname) {
    // Return map from path to filecontent generator
    var flat = {}, subFlat, mimeType, generator, stat,
        i, files, name;
    if (!fs.existsSync(pathname)) {
        console.warn(pathname, "does not exist. IGNORING.");
    } else {
        stat = fs.statSync(pathname);
        if (stat.isDirectory()) {
            files = fs.readdirSync(pathname);
            for (i = 0; i < files.length; i++) {
                name = path.join(pathname, files[i]);
                // Need to check for some odd links
                if (fs.existsSync(name)) {
                    subFlat = buildFileTree(name); // Recurse
                    // Copy to this flat structure (names are not
                    // relative)
                    for (name in subFlat) {
                        flat[name] = subFlat[name];
                    }
                }
            }
        } else if (stat.isFile()) {
            flat[pathname] = fileGenerator(pathname);
        } else {
            console.error(pathname, "is neither a directory nor a file. IGNORING.");
        }
    }
    return flat;
};

Files.prototype.build = function () {
    return buildFileTree(this.pathname);
};

module.exports = Files;
