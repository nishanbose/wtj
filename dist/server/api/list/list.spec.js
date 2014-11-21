'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Seed = require('../../config/seed');
var List = require('./list.model');

var callback = function(err, results) {
  if (err) console.log(err);
  return results;
};

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

describe('/api/list', function() {

  before(setup);

  it('/api/list/:id response should contain a title, about, and items', function(done) {
    List.findOne(function(err, list) {
      if (err) return done(err);
      list.title.should.be.ok;
      list.about.should.be.ok;
      list.items.should.be.ok;
      (list.items.length !== undefined).should.be.true;
      done();
    });
  });

  it('/api/list/:id response should contain one or more categories', function(done) {
    List.findOne(function(err, list) {
      if (err) return done(err);
      list.categories.should.be.ok;
      (list.categories.length !== undefined).should.be.true;
      done();
    });
  });

  it('/api/list response should respond with JSON array', function(done) {
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
  it('/api/list response should respond with top n voted', function(done) {
    request(app)
      .get('/api/lists?top=3')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.equal(3);
        done();
      });
  });

  it('/api/list response should be populated with categories', function(done) {
    request(app)
      .get('/api/lists?top=3')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.not.equal(0);

        var list1 = res.body[0];
        list1.categories.length.should.equal(3);
        list1.categories.should.be.instanceof(Array);
        list1.categories[0].should.be.instanceof(Object);
        list1.categories[0].name.should.be.instanceof(String);
        done();
      });
  });

  it('should respond with a single list', function(done) {
    List.findOne(function(err) {
      if (err) return done(err);
      var list = arguments[1];
      // console.log('list');
      // console.log(list);
      var id = list._id;

      request(app)
      .get('/api/lists/' + id)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('items');
        res.body.should.have.property('categories');
        res.body.should.have.property('featured');
        res.body.items.should.be.instanceof(Array);
        res.body.categories.should.be.instanceof(Array);
        res.body.featured.should.be.instanceof(Boolean);
        done();
      });
    });
  });
});
