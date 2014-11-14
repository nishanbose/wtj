'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Seed = require('../../config/seed');

describe('GET /api/lists', function() {

  beforeEach(function(done) {
    Seed.createLists(5, done);
  });
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/lists')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

var List = require('./list.model');

describe('List', function() {

  beforeEach(function(done) {
    Seed.createLists(5, done);
  });

  it('should contain a title, about, and items', function(done) {
    List.findOne(function(err, list) {
      if (err) return done(err);
      list.title.should.be.ok;
      list.about.should.be.ok;
      list.items.should.be.ok;
      done();
    });
  });
});
