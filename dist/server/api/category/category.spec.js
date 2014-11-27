'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Seed = require('../../config/seed');
var Category = require('./category.model');

describe('/api/categories', function() {

  beforeEach(function(done) {
    Seed.createCategories(5, done);
  });

  afterEach(function(done) {
    Category.find().remove(function(err) {
      done(err);
    });
  });

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/categories')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should contain a name and about', function(done) {
    Category.findOne(function(err, cat) {
      if (err) return done(err);
      // console.log(cat);
      cat.name.should.be.ok;
      cat.about.should.be.ok;
      done();
    });
  });
});
