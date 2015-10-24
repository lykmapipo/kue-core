'use strict';

//dependencies
var expect = require('chai').expect;
var path = require('path');
var redis = require(path.join(__dirname, '..', '..', 'lib', 'redis'));

describe('redis', function() {

    it('should be able to export require redis utilities', function(done) {
        
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

});