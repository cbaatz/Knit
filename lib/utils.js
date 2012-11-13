var fs = require('fs'),
    path = require('path');

exports.ensureDirsSync = function (pathname) {
    // Ensure pathname exists; that is, create dirs that don't exists.
    var dirs, previous, i, current, createdDirs = [];
    if (!fs.existsSync(pathname)) {
        dirs = path.resolve(pathname).split('/');
        previous = '/';
        for (i = 0; i < dirs.length; i++) {
            current = path.join(previous, dirs[i]);
            if (!fs.existsSync(current)) {
                fs.mkdirSync(current);
                createdDirs.push(dirs[i]);
            }
            previous = current;
        }
    }
    return createdDirs;
};

// TODO: Create a uniform way of testing if a structure is a structure
// (also in tree).
exports.ensureResources = function (resourcesOrStructure) {
    if (resourcesOrStructure.build instanceof Function) {
        return resourcesOrStructure.build();
    } else {
        return resourcesOrStructure;
    }
};
