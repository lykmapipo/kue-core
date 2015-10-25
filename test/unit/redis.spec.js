'use strict';

//dependencies
var expect = require('chai').expect;
var path = require('path');
var queue = require('events').EventEmitter;
var redis = require(path.join(__dirname, '..', '..', 'lib', 'redis'));

describe('redis', function() {

    it('should be able to export required redis utilities', function(done) {

        expect(redis.configureFactory).to.exist;
        expect(redis.configureFactory).to.be.a('function');

        expect(redis.createClientFactory).to.exist;
        expect(redis.createClientFactory).to.be.a('function');

        expect(redis.client).to.exist;
        expect(redis.client).to.be.a('function');

        expect(redis.pubsubClient).to.exist;
        expect(redis.pubsubClient).to.be.a('function');

        expect(redis.reset).to.exist;
        expect(redis.reset).to.be.a('function');

        done();
    });

    it('should be able to configure redis connection factory', function(done) {
        //TODO adding more client factory scenarios

        expect(redis.createClient).to.not.exist;

        redis.configureFactory({}, queue);

        expect(redis.createClient).to.exist;
        expect(redis.createClient).to.be.a('function');

        var client = redis.createClient();

        //assert client
        expect(client).to.not.be.null;
        expect(client.connectionOption).to.exist;
        expect(client.connectionOption.port).to.be.equal(6379);
        expect(client.connectionOption.host).to.be.equal('127.0.0.1');

        //assert client key prefix
        expect(client.prefix).to.be.equal('q');

        //assert client getKey factory
        expect(client.getKey).to.be.a('function');
        expect(client.getKey('kue')).to.be.equal('q:kue');

        client.quit();

        done();
    });

    it('should be able to return or recreate new redis client', function(done) {
        expect(redis._client).to.be.null;

        redis.client();
        expect(redis._client).to.not.be.null;

        done();
    });

    it('should be able to return or recreate new redis pubsub client', function(done) {
        expect(redis._pubsub).to.be.null;

        redis.pubsubClient();
        expect(redis._pubsub).to.not.be.null;

        done();
    });

    it('should be able to reset pubsub and normal redis clients', function(done) {
        expect(redis._client).to.not.be.null;
        expect(redis._pubsub).to.not.be.null;

        redis.reset();
        expect(redis._client).to.be.null;
        expect(redis._pubsub).to.be.null;

        done();
    });

    after(function(done) {
        redis.reset();
        done();
    });

});