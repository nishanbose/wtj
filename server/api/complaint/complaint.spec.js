'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Seed = require('../../config/seed');
var List = require('../list/list.model');
var Category = require('../category/category.model');
var User = require('../user/user.model');
var helpers = require('../helpers.service')

var setup = function(done) {
  var tracer = require('tracer').console({ level: 'warn' });
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

var teardown = function(done) {
  var tracer = require('tracer').console({ level: 'warn' });
  var async = require('async');
  async.series([
    function(callback) { List.find().remove(callback); },
    function(callback) { Category.find().remove(callback); },
    function(callback) { User.find().remove(callback); }
    ], function(err, results) {
      // console.log('async callback 1')
      done(err);
  });
};

describe('GET /api/complaints', function() {

  beforeEach(setup);
  afterEach(teardown);

  it('should respond with JSON array', function(done) {
    request(app).get('/api/complaints')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      res.body.should.be.instanceof(Array);
      done();
    });
  });

  it('should record a complaint', function(done) {
    List.findOne(function(err, list) {
      if (err) return done(err);
      request(app).post('/api/complaints')
      .send({ list: list._id, reason: 'the reason' })
      .expect(204, done);
    });
  });

});
