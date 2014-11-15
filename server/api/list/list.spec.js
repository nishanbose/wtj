'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Seed = require('../../config/seed');
var List = require('./list.model');

describe('List', function() {

  before(function(done) {
    Seed.createLists(5, done);
  });

  it('should contain a title, about, and items', function(done) {
    List.findOne(function(err, list) {
      if (err) return done(err);
      list.title.should.be.ok;
      list.about.should.be.ok;
      list.items.should.be.ok;
      (list.items.length !== undefined).should.be.true;
      done();
    });
  });

  it('should contain one or more categories', function(done) {
    List.findOne(function(err, list) {
      if (err) return done(err);
      list.categories.should.be.ok;
      (list.categories.length !== undefined).should.be.true;
      done();
    });
  });
});

describe('GET /api/lists', function() {
  before(function(done) {
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
  it('should respond with top n', function(done) {
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

  it('should be populated with categories', function(done) {
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
});

describe('GET /api/list', function() {
  var lists = null;
  
  before(function(done) {
    Seed.createLists(5, done);
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
        res.body.items.should.be.instanceof(Array);
        res.body.categories.should.be.instanceof(Array);
        res.body.categories[0].should.be.instanceof(Object);
        res.body.categories[0].name.should.be.instanceof(String);
        done();
      });
    });
  });
});
