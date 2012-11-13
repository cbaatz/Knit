module.exports = function (resources) {
    var pathname, generator, map = {};

    for (pathname in resources) {
        generator = resources[pathname];
        if (typeof generator.id === 'string') {
            if (map[generator.id]) {
                console.warn("Duplicate name:", "'" + generator.id + "'");
            } else {
                map[generator.id] = pathname;
            }
        }
    }
    return map;
};
