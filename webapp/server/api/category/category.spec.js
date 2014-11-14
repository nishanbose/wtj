'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

var Category = require('./category.model');

var createCategories = function(n, done) {
  Category.find({}).remove(function() {
    var cat_params = [];
    for (var i=1 ; i <= n ; ++i) {
      cat_params.push({
        provider: 'local',
        name: 'Category ' + i,
        description: 'Category :i description goes here.'.replace(/:i/, i)
      });
    }
    Category.create(cat_params, function(err) {
      console.log('finished populating categories');
      if (err) done(err);
      done();
    });
  });
}

describe('GET /api/categories', function() {

  beforeEach(function(done) {
    createCategories(5, done);
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

  it('should contain a name and description', function(done) {
    Category.findOne(function(err, cat) {
      if (err) return done(err);
      cat.name.should.be.ok;
      cat.description.should.be.ok;
      done();
    });
  });
});
