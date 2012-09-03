var Resources = module.exports = function (options) {
    this.urls = {};
    this.options = options;
};

Resources.prototype.list = function () {
    return JSON.stringify(this.options);
};
