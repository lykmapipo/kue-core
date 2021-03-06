'use strict';

/*!
 * kue - RedisClient factory
 * Copyright (c) 2013 Automattic <behradz@gmail.com>
 * Copyright (c) 2011 LearnBoost <tj@learnboost.com>
 * MIT Licensed
 * Author: behradz@gmail.com
 */

//dependencies
var redis = require('redis');
var _ = require('lodash');
var url = require('url');

//defaults redis configurations
var defaults = {
    prefix: 'q',
    redis: {
        port: 6379,
        host: '127.0.0.1'
    }
};


/**
 * Configure redis connection factory
 * @param options
 * @param queue
 * @private
 */
exports.configureFactory = function(options, queue) {
    //merge with defaults
    options = _.merge(defaults, options);

    if (typeof options.redis === 'string') {
        // parse the url
        var connInfo = url.parse(options.redis, true /* parse query string */ );
        if (connInfo.protocol !== 'redis:') {
            throw new Error('kue connection string must use the redis: protocol');
        }

        options.redis = {
            port: connInfo.port || 6379,
            host: connInfo.hostname,
            // see https://github.com/mranney/node_redis#rediscreateclient
            options: connInfo.query
        };

        if (connInfo.auth) {
            options.redis.auth = connInfo.auth.replace(/.*?:/, '');
        }

    }

    options.redis = options.redis || {};

    // guarantee that redis._client has not been populated.
    // may warrant some more testing - i was running into cases where shutdown
    // would call redis.reset but an event would be emitted after the reset
    // which would re-create the client and cache it in the redis module.
    exports.reset();

    /**
     * Create a RedisClient.
     *
     * @return {RedisClient}
     * @api private
     */
    exports.createClient = function() {
        var clientFactoryMethod =
            options.redis.createClientFactory || exports.createClientFactory;

        var client = clientFactoryMethod(options);

        //listen for client errors and emit them on
        //queue
        client.on('error', function(err) {
            queue.emit('error', err);
        });

        client.prefix = options.prefix;

        // redefine getKey to use the configured prefix
        client.getKey = function(key) {
            return this.prefix + ':' + key;
        };

        return client;
    };
};


/**
 * Create a RedisClient from options
 * @param options
 * @return {RedisClient}
 * @api private
 */
exports.createClientFactory = function(options) {
    //merge with defaults
    options = _.merge(defaults, options);

    var socket = options.redis.socket;
    var port = !socket ? (options.redis.port || 6379) : null;
    var host = !socket ? (options.redis.host || '127.0.0.1') : null;
    var client = redis.createClient(socket || port, host, options.redis.options);
    if (options.redis.auth) {
        client.auth(options.redis.auth);
    }
    if (options.redis.db) {
        client.select(options.redis.db);
    }
    return client;
};


/**
 * Create or return the existing RedisClient.
 *
 * @return {RedisClient}
 * @api private
 */
exports.client = function() {
    return exports._client || (exports._client = exports.createClient());
};


/**
 * Return the pubsub-specific redis client.
 *
 * @return {RedisClient}
 * @api private
 */
exports.pubsubClient = function() {
    return exports._pubsub || (exports._pubsub = exports.createClient());
};


/**
 * Resets internal variables to initial state
 *
 * @api private
 */
exports.reset = function() {
    exports._client && exports._client.quit();
    exports._pubsub && exports._pubsub.quit();
    exports._client = null;
    exports._pubsub = null;
};