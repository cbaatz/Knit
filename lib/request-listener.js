var url = require('url'),
    ensureResources = require('./utils').ensureResources;

module.exports = function (resourcesOrStructure, generatorContext) {
    var resources = ensureResources(resourcesOrStructure);
    return function (req, res) {
        var generator = resources[url.parse(req.url).pathname];
        if (generator) {
            generator(res, generatorContext);
        }
        else {
            res.writeHead(404, "NOT FOUND");
            res.end("404 NOT FOUND");
       }
    };
};
