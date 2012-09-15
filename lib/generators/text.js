var content = require('../content');

var TextGenerator = function (text) {
    this.content = new content.String(text || '', 'text.html');
};
TextGenerator.prototype.generate = function () {
    return this.content;
};

module.exports = TextGenerator;