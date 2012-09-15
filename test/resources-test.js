var vows = require('vows'),
    assert = require('assert'),
    Resources = require('../lib/resources');

vows.describe('Resources').addBatch({
    'when initialising without options': {
        topic: new(Resources),
        'we have urls': function (topic) {
            assert.include(topic, 'urls');
        }
    }
    // 'when dividing a number by zero': {
    //     topic: function () { return 42 / 0 },

    //     'we get Infinity': function (topic) {
    //         assert.equal (topic, Infinity);
    //     }
    // },
    // 'but when dividing zero by zero': {
    //     topic: function () { return 0 / 0 },

    //     'we get a value which': {
    //         'is not a number': function (topic) {
    //             assert.isNaN (topic);
    //         },
    //         'is not equal to itself': function (topic) {
    //             assert.notEqual (topic, topic);
    //         }
    //     }
    // }
}).export(module);
