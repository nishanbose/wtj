'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Seed = require('../../config/seed');
var Vote = require('./vote.model');
var User = require('../user/user.model');
var List = require('../list/list.model');
var async = require('async');

var setup = function(done) {
  var tracer = require('tracer').console({ level: 'info' });
  async.parallel([
    function(callback) { Seed.createUsers(10, callback) },
    function(callback) { Seed.createCategories(5, callback) },
    function(callback) { Seed.createLists(30, callback) }
    ], function(err, results) {
      if (err) { return done(err); }

      var users = results[0];
      var cats = results[1];
      var lists = results[2];
      
      Seed.assignListCategoriesAndAuthors(lists, cats, users, function(err) {
        if (err) done(err);
      });

      // Let each user vote on 3 lists.
      var kList = 0;
      var votes = [];
      for (var iUser=0 ; iUser < users.length ; ++iUser) {
        var user = users[iUser];
        if (user.role !== 'user') { continue; }
        for (var j=0 ; j < 3 ; ++j) {
          var list = lists[kList++ % lists.length];
          votes.push({ user: user._id, list: list._id });
        }
      }
      // tracer.log(votes);
      Vote.find().remove(function() {
        Vote.create(votes, function(err, votes) {
          done(err);
        });
      });
  });
};

describe('/api/votes', function() {

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
    
  it('populates user and list', function(done) {
    request(app).get('/api/votes')
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function(err, res) {
      if (err) return done(err);
      res.body.should.be.instanceof(Array);
      (res.body.length > 0).should.be.true;
      var vote = res.body[0];
      vote.should.have.property('list');
      vote.should.have.property('user');
      vote.user.should.be.instanceof(Object);
      vote.list.should.be.instanceof(Object);
      vote.user.should.have.property('_id');
      vote.user.should.have.property('email');
      vote.list.should.have.property('_id');
      vote.list.should.have.property('title');
      done();
    });
  });

  it('only authenticated user can vote', function(done) {
    var tracer = require('tracer').console({ level: 'warn' });
    List.findOne(function(err, list) {
      if (err) return done(err);
      tracer.log(list);
      
      // Find all the votes for this list.
      Vote.find({ list: list._id }, function(err, votes) {
        if (err) return done(err);
        var uids = votes.map(function(vote) { return vote.user;});
        
        // Find a user that hasn't voted on this list.
        User.findOne({ _id: { $not: { $in: uids }}}, function(err, user) {
          if (err) return done(err);

          // Use should not be able to vote without authentication.
          request(app).post('/api/votes')
          .send({ user: user._id, list: list._id })
          .expect(401, done);
        });
      });
    });
  });

  it('user can vote on list only once', function(done) {
    var tracer = require('tracer').console({ level: 'warn' });
    Vote.findOne(function(err, vote) {
      if (err) return done(err);
      var uid = vote.user;
      var lid = vote.list;
      tracer.log(uid);
      tracer.log(lid);

      User.findById(uid, function(err, user) {
        if (err) return done(err);
        tracer.log(user);
    
        // Authenticate user
        request(app).post('/auth/local')
        .send({email: user.email, password: 'test'})
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          var token = res.body.token;

          // Attempt to vote again on same list.
          request(app).post('/api/votes')
          .set('authorization', 'Bearer ' + token) // see https://github.com/DaftMonk/generator-angular-fullstack/issues/494#issuecomment-53716281
          .send({ user: uid, list: lid })
          .expect(403, done);
        });
      });
    });
  });
});
