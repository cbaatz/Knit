var Tree = require('./structures/tree'),
    Files = require('./structures/files');

exports.tree = function (config) {
    return new Tree(config);
};

exports.files = function (config) {
    return new Files(config);
};
