'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var Seed = require('../../config/seed');
var List = require('./list.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

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
  
  it('/api/list?order=popular should respond with top n voted', function(done) {
    // Pick a list and fake some votes.
    List.findOne(function(err, list) {
      if (err) return done(err);
      list.nVotes = 99;
      list.save(function(err) {
        if (err) return done(err);
        request(app)
        .get('/api/lists?top=3&order=popular')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Array);
          res.body.length.should.equal(3);
          String(list._id).should.be.equal(String(res.body[0]._id));
          res.body[0].nVotes.should.be.equal(99);
          done();
        });
      });
    });
  });
  
  it('/api/list?order=recent should respond with top n recently updated', function(done) {
    // Pick a list and update it.
    var tracer = require('tracer').console({ level: 'warn' });
    List.findOne(function(err, list) {
      if (err) return done(err);
      list.nVotes = -1;
      list.save(function(err) {
        if (err) return done(err);
        request(app)
        .get('/api/lists?top=3&order=recent')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Array);
          res.body.length.should.equal(3);
          String(list._id).should.be.equal(String(res.body[0]._id));
          res.body[0].nVotes.should.be.equal(-1);
          done();
        });
      });
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
    var tracer = require('tracer').console({ level: 'warn' });
    List.findOne(function(err, list) {
      if (err) return done(err);
      tracer.log(list._id);

      request(app)
      .get('/api/lists/' + list._id)
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

  // done = function(err, token, results) {}
  var withAuthUser = function(done) {
    var User = require('../user/user.model');
    var tracer = require('tracer').console({ level: 'warn' });

    User.findOne(function(err, user) {
      if (err) return done(err);
      tracer.trace('withAuthUser');
      tracer.trace(user.email);
  
      // Authenticate user
      request(app).post('/auth/local')
      .send({email: user.email, password: 'test'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        done(err, res.body.token, res);
      });
    });
  };

  it('should update a list and its items', function(done) {
    var User = require('../user/user.model');
    var tracer = require('tracer').console({ level: 'warn' });

    List.findOne(function(err, list) {
      if (err) return done(err);
      list.items.should.be.instanceof(Array);
      list.items.length.should.be.ok;
      list.items[0].should.be.instanceof(String);

      list.items[0] = 'one';
      list.items[1] = 'two';
      list.items[2] = 'three';

      withAuthUser(function(err, token, results) {
        // Attempt to update the list.
        tracer.trace('PUT /api/lists/' + list._id);
        request(app).put('/api/lists/' + list._id)
        .set('authorization', 'Bearer ' + token) // see https://github.com/DaftMonk/generator-angular-fullstack/issues/494#issuecomment-53716281
        .send(list)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          // Verify that the items have been updated.
          List.findById(list._id, function(err, updated) {
            if (err) return done(err);
            list.items.should.be.instanceof(Array);
            list.items.length.should.be.ok;
            list.items[0].should.be.instanceof(String);
            list.items[0].should.be.equal('one');
            list.items[1].should.be.equal('two');
            list.items[2].should.be.equal('three');
            done();
          });
        });
      });
    });
  });
});
