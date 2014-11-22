'use strict';

var _ = require('lodash');
var List = require('./list.model');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = require('mongoose').Types.ObjectId;
var auth = require('../../auth/auth.service');
var helpers = require('../helpers.service');

// Get list of lists
exports.index = function(req, res) {
  var tracer = require('tracer').console({ level: 'trace' });
  var query = _.clone(req.query);
  tracer.log(req.query);
  var top = parseInt(query.top) || 0;
  var catId = query.category || false;
  var order = query.order || 'recent'
  
  delete query.top;
  delete query.category;
  delete query.order;
  var q = List.find(query);
  
  if (order === 'recent') {
    tracer.trace('sort by recent');
    q.sort({ udpatedAt: -1 });    
  } else if (order === 'popular') {
    q.sort({ nVotes: -1 });
  } else {
    q.sort({ title: 1 });
  }
  if (catId) { q.find({ categories: { $in: [ catId ]}}) }
  if (top) { q.limit(top); }
  // mongoose.set('debug', true);
  q.exec(function (err, lists) {
    if(err) { return helpers.handleError(res, err); }
    List.populate(lists, { path: 'categories author', select: '_id name email' }, function(err, popList) {
      if(err) { return helpers.handleError(res, err); }
      return res.json(200, lists);
    });
  });
};

// Get a single list
exports.show = function(req, res) {
  List.findById(req.params.id, function (err, list) {
    if(err) { return helpers.handleError(res, err); }
    if(!list) { return res.send(404); }
    List.populate(list, { path: 'categories author', select: '_id name email' }, function(err, popList) {
      if(err) { return helpers.handleError(res, err); }
      return res.json(200, list);
    });
  });
};

// Creates a new list in the DB.
exports.create = function(req, res) {
  var tracer = require('tracer').console({ level: 'warn' });
  var list_params = _.extend({ author: req.user._doc, featured: false}, req.body);
  tracer.log(list_params);
  List.create(list_params, function(err, list) {
    if(err) { return helpers.handleError(res, err); }
    return res.json(201, list);
  });
};

// Updates an existing list in the DB.
exports.update = function(req, res) {
  if (!auth.hasRole('admin') && req.user._id !== req.body.author._id) {return res.send(401); }
  if(req.body._id) { delete req.body._id; }
  if(req.body.author) { delete req.body.author; } // not allowed
  List.findById(req.params.id, function (err, list) {
    if (err) { return helpers.handleError(res, err); }
    if(!list) { return res.send(404); }
    var updated = _.merge(list, req.body);
    updated.save(function (err) {
      if (err) { return helpers.handleError(res, err); }
      return res.json(200, list);
    });
  });
};

// Deletes a list from the DB.
exports.destroy = function(req, res) {
  List.findById(req.params.id, function (err, list) {
    if(err) { return helpers.handleError(res, err); }
    if(!list) { return res.send(404); }
    list.remove(function(err) {
      if(err) { return helpers.handleError(res, err); }
      return res.send(204);
    });
  });
};
