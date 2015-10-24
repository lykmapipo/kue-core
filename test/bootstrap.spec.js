'use strict';

//dependencies
var path = require('path');
var async = require('async');
var redis = require(path.join(__dirname, '..', 'lib', 'redis'));

//redis client for database cleanups
var redis = redis.createClientFactory({
    redis: {}
});

/**
 * @description clean up a database
 */
function cleanup(callback) {
    redis
        .keys('q*', function(error, rows) {
            if (error) {
                callback(error);
            } else {
                async
                .each(
                    rows,
                    function(row, next) {
                        redis.del(row, next);
                    },
                    callback);
            }
        });
}


//clean any previous data
//if any
before(function(done) {
    cleanup(done);
});


//clean all data
//introduced with these specs
after(function(done) {
    cleanup(done);
});