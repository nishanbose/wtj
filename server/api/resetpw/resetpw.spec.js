'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var async = require('async');
var Resetpw = require('./resetpw.model');
var mandrillSvc = require('../../components/mail/mandrill.service');
var User = require('../user/user.model');
var tracer = require('tracer').console({ level: 'warn' });

describe('GET /api/resetpw', function() {

  // it('should respond with JSON array', function(done) {
  //   request(app)
  //     .get('/api/resetpw')
  //     .expect(200)
  //     .expect('Content-Type', /json/)
  //     .end(function(err, res) {
  //       if (err) return done(err);
  //       res.body.should.be.instanceof(Array);
  //       done();
  //     });
  // });

  var user;

  beforeEach(function(done) {
    var resetUser = function(done) {
      User.find().remove(function(err) {
        User.create({
          provider: 'local',
          email: 'test@test.com',
          name: 'Test User',
          password: 'forgot it!',
          role: 'user'
        }, function(err, user) {
          done(err, user);
        });
      });
    };
    var resetResetPw = function(done) {
      Resetpw.find().remove(function(err) {
        done(err);
      });
    };
    async.parallel([resetUser, resetResetPw], function(err, results) {
      // var tracer = require('tracer').console({ level: 'log' });
      if (err) {done(err); }
      user = results[0];
      (!!user).should.be.ok;
      (!!user._id).should.be.ok;
      user._id.should.be.instanceOf(Object);
      done();
    });
  });

  afterEach(function(done) {
    var wipeUser = function(done) {
      User.find().remove(function(err) {
        done(err);
      })
    };
    var wipeResetPw = function(done) {
      Resetpw.find().remove(function(err) {
        done(err);
      });
    };
    async.parallel([wipeUser, wipeResetPw], function(err) {
      done(err);
    });
  });

  it('should create a new instance', function(done) {
    request(app).post('/api/resetpw')
    .send({ email: user.email })
    .expect(204, function(err, res) {
      if (err) { 
        // tracer.debug(Object.keys(res));
        tracer.debug(res.text);
        return done(err); 
      }
      Resetpw.findOne({ user: user._id }, function(err, resetpw) {
        if (err) { return done(err); }
        (!!resetpw).should.be.true;
        // We have no way to test if the message was actually sent in test mode
        // because Mandrill will not even store a record for the message if it was rejected.
        // var msg_id = resetpw._id;
        // var mandrill_api = require('mandrill-api/mandrill');
        // var apiKey = mandrillSvc.apiKey();
        // var mandrill = new mandrill_api.Mandrill(apiKey);

        // mandrill.messages.info({ key: apiKey, id: resetpw.messageKey }, function(err, res) {
        //   if (err) {
        //     tracer.error(err);
        //     return done(err); 
        //   }
        //   res.email.should.be(user.email);
        //   // mandrill won't return to us the content of the message or we could test for 
        //   // presence of key in the message.
        // });
        done();
      });
    });
  });

  var createOne = function(done) {
    request(app).post('/api/resetpw')
    .send({ email: user.email })
    .expect(204, function(err, res) {
      if (err) { 
        tracer.debug(res.text);
      }
      done(err, res);
    });
  };

  it('requesting another reset wipes the first instance', function(done) {
    async.series([createOne, createOne], function(err, results) {
      if (err) { return done(err); }
      Resetpw.find({ user: user._id }, function(err, res) {
        if (err) { return done(err); }
        res.length.should.be.equal(1);
        done();
      });
    });
  });

  it('/api/resetpw/:key with valid key will return a token', function(done) {
    Resetpw.create({ user: user._id }, function(err, resetpw) {
      if (err) { return done(err); }
      // var tracer = require('tracer').console({ level: 'debug' });
      tracer.debug(resetpw);
      request(app).get('/api/resetpw/' + resetpw.key)
      .expect(200)
      // .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) { return done(err); }
        res.body.token.should.be.ok;
        done();
      });
    });
  });

  it('/api/resetpw/:key with invalid key will return 404', function(done) {
    Resetpw.create({ user: user._id }, function(err, resetpw) {
      if (err) { return done(err); }
      request(app).get('/api/resetpw/' + 'badkey')
      .expect(404, done);
    });
  });

});
