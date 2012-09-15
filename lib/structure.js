var path = require('path'),
    fs = require('fs'),
    FileGenerator = require('generators/file');

var BasicStructure = function (resources) {
    this.resources = resources || {};
};
BasicStructure.prototype.getGenerators = function () {
    return this.resources || {};
}

var PrefixStructure = function (prefixes) {
    this.prefixes = prefixes || {};
};
PrefixStructure.prototype.getGenerators = function () {
    var flat = {}, postfix, prefix, subFlat;
    for (prefix in this.prefixes) {
        subFlat = this.prefixes[prefix].getGenerators();
        for (postfix in subFlat) {
            flat[path.join(prefix, postfix)] = subFlat[postfix];
        }
    };
    return flat;
};

// FileStructure creates a structure of generators mirroring a folder.
var FilesStructure = function (pathname) {
    this.pathname = pathname || '.';
};

var buildFileTree = function (pathname) {
    // Return map from path to filecontent generator
    var flat = {}, subFlat, mimeType, generator,
        stat = fs.statSync(pathname),
        i, files, name;
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
    } else if (stat.isFile() && fs.existsSync(pathname)) {
        flat[pathname] = new FileGenerator(pathname);
    } else {
        console.error(pathname, "is neither a directory or file. IGNORING.");
    }
    return flat;
};

FilesStructure.prototype.getGenerators = function () {
    var flat = buildFileTree(this.pathname);
    return flat;
};

exports.Basic = BasicStructure;
exports.Prefix = PrefixStructure;
exports.Files = FilesStructure;
