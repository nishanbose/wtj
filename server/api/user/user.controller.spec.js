'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('./user.model');
// var Seed = require('../../config/seed');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var helpers = require('../helpers.service');
var tracer = require('tracer').console({ level: 'trace' });

var createUsers = function(done) {
  var users = [
  {
    provider: 'local',
    name: 'Admin',
    email: "admin@admin.com",
    password: 'admin',
    role: 'admin',
    active: true
  },
  {
    provider: 'local',
    name: 'New User',
    email: "new@user.com",
    password: 'password',
    role: 'user',
    active: true
  }];
  User.find().remove(function() {
    User.create(users, function(err) {
      return done(err);
    });
  });
};

describe('GET /api/users', function() {
  before(createUsers);
  var token;  // auth token

  before(function(done) {
    request(app).post('/auth/local')
    .send({email: 'admin@admin.com', password: 'admin'})
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      token = res.body.token;
      done();
    });
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
      name: 'New User 2',
      email: "newer@user.com",
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
  
  it('should fetch a user', function(done) {
    User.findOne(function(err, user) {
      if (err) return done(err, user);
      user._id.should.be.instanceof(Object);
      request(app).get('/api/users/' + user._id)
      .set('authorization', 'Bearer ' + token) // see https://github.com/DaftMonk/generator-angular-fullstack/issues/494#issuecomment-53716281
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        tracer.log(res.body);
        res.body.should.be.instanceof(Object);
        var res_user = res.body;
        (res_user.hashedPassword === undefined).should.be.true;
        (res_user.salt === undefined).should.be.true;
        res_user._id.should.be.equal('' + user._id);
        done();
      });
    });
  });
/*  
  it('should update a user', function(done) {
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
*/
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
