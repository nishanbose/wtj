'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('./user.model');
var Seed = require('../../config/seed');

describe('GET /api/users', function() {
  before(function() {
  });

  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });

  it('should create a new user', function(done) {
    request(app)
    .post('/api/users')
    .send({
      name: 'Test User',
      email: "test@user.com",
      password: 'password',
      active: true
    })
    .expect(201)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      res.body.should.be.instanceof(Object);
      res.body.token.should.be.instanceof(String);
      done();
    });
  });

/*
  it('should respond to an array of ObjectId', function(done) {
    Event.find({}).limit(3).exec(function(err, events) {
      if (err) return done(err);
      var query = events.map(function(ev) {
        return '_id[]=' + ev._id
      }).join('&');
      // console.log(query);
      request(app)
      .get('/api/events?' + query)
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.equal(3);
        done();
      });
    });
  });
*/

});
