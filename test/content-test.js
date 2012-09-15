var vows = require('vows'),
    assert = require('assert'),
    fs = require('fs'),
    helpers = require('./helpers'),
    content = require('../lib/content');

vows.describe('Content').addBatch({
    'the content module': {
        topic: function () { return content; },
        'has a base Content class': function (topic) {
            assert.isFunction(topic.Content);
        },
        'has a File class': function (topic) {
            assert.instanceOf(new topic.File, content.Content);
        },
        'has a Stream class': function (topic) {
            assert.instanceOf(new topic.Stream, content.Content);
        },
        'has a String class': function (topic) {
            assert.instanceOf(new topic.String, content.Content);
        }
    }
}).addBatch({
    'after instantiating a content.File with a filename': {
        topic: function () {
            return new content.File('./test/fixtures/hello.txt');
        },
        'it has a config': function (fileContent) {
            assert.isObject(fileContent.config);
        },
        'we can': {
            'get the filename': function (fileContent) {
                assert.equal(fileContent.filename(), './test/fixtures/hello.txt');
            },
            'get its content': function (fileContent) {
                assert.equal(fileContent.toString(), 'Hello!\n');
            },
            'write it to another file': {
                topic: function (fileContent) {
                    var callback = this.callback;
                    require('crypto').randomBytes(16, function(ex, buf) {
                        if (ex) throw ex;
                        var newFilename = './test/fixtures/tmp-' + buf.toString('hex');
                        fileContent.writeTo(newFilename, function () {
                            callback(newFilename, fileContent);
                        });
                    });
                }
            },
            'change the filename': {
                topic: function (fileContent) {
                    return fileContent.filename('./test/fixtures/goodbye.txt');
                },
                'to goodbye.txt': function (fileContent) {
                    assert.equal(fileContent.filename(), './test/fixtures/goodbye.txt');
                },
                'and get its content': function (topic) {
                    assert.equal(topic.toString(), 'Goodbye!\n');
                }
            }
        }
    }
}).export(module);
