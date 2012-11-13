var Tree = require('./lib/structures/tree'),
    Files = require('./lib/structures/files');

// TODO: Expose more generic tree map/reduce functions that we can use
// to write file-loaders and asset-tree flatteners.
exports.tree = function (config) { return new Tree(config); };
exports.files = function (config) { return new Files(config); };

exports.requestListener = require('./lib/request-listener'); // rL(resources, generatorContext);
exports.mapNames = require('./lib/map-names'); // mapNames(resources);
exports.force = require('./lib/force'); // force(generator, callback);
exports.write = require('./lib/write'); // write(resources, config, callback);
exports.upload = require('./lib/upload'); // upload(resource, config, callback);

// Export basic generator factories
exports.file = require('./lib/factories/file');
exports.string = require('./lib/factories/string');
