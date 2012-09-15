var path = require('path');

var Tree = function (branches) {
    this.branches = branches || {};
};
Tree.prototype.build = function () {
    var flat = {}, postfix, branch, subFlat, value;
    for (branch in this.branches) {
        value = this.branches[branch];
        if (value.build instanceof Function) {
            // Assume value is a structure
            subFlat = value.build();
            for (postfix in subFlat) {
                flat[path.join(branch, postfix)] = subFlat[postfix];
            }
        } else if (value instanceof Function) {
            // Assume value is a generator
            flat[branch] = value;
        } else {
            console.error(value, "is neither a structure nor a generator. IGNORING.");
        }
    }
    return flat;
};

module.exports = Tree;