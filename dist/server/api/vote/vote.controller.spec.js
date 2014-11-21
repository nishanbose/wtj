'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Seed = require('../../config/seed');

var setup = function(done) {
  var async = require('async');
  async.series([
    function(callback) { Seed.createUsers(10, callback) },
    function(callback) { Seed.createCategories(5, callback) },
    function(callback) { Seed.createLists(30, callback) }
    ], function(err, results) {
      // console.log('async callback 1')
      if (err) { return done(err); }

      var users = results[0];
      var cats = results[1];
      var lists = results[2];
      
      Seed.assignListCategoriesAndAuthors(lists, cats, users, function(err) {
        done(err);
      });
  });
};

describe('GET /api/votes', function() {

  before(setup);

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/votes')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('only owner of vote should be able to remove it', function() {

  });
});
