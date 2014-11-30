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
  var tracer = require('tracer').console({ level: 'warn' });
  var query = _.clone(req.query);
  var top = parseInt(query.top) || 0;
  var catId = query.category || false;
  var order = query.order || 'recent'
  
  delete query.top;
  delete query.category;
  delete query.order;
  tracer.log(query);

  var q = List.find(query);
  if (catId) { q.find({ categories: { $in: [ catId ]}}) }
  if (top) { q.limit(top); }
  
  if (order === 'recent') {
    // tracer.trace('sort by recent');
    q.sort({ updatedAt: -1 });    
  } else if (order === 'popular') {
    // tracer.trace('sort by popular');
    q.sort({ nVotes: -1 });
  } else {
    // tracer.trace('sort by title');
    q.sort({ title: 1 });
  }
  q.populate({ path: 'categories author', select: '_id name email' });

  // mongoose.set('debug', true);
  q.exec(function (err, lists) {
    if(err) { return helpers.handleError(res, err); }
    // var tracer = require('tracer').console({ level: 'debug' });
    // lists.forEach(function(list) { tracer.debug(list.author); });
    return res.json(200, lists);
  });
};

// Get a single list
exports.show = function(req, res) {
  List.findById(req.params.id)
  .populate({ path: 'categories author', select: '_id name email' })
  .exec(function (err, list) {
    if(err) { return helpers.handleError(res, err); }
    if(!list) { return res.send(404); }
    return res.json(200, list);
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
  var tracer = require('tracer').console({ level: 'debug' });
  
  if (!auth.hasRole('admin') && req.user._id !== req.body.author._id) {return res.send(401); }
  if(req.body._id) { delete req.body._id; }
  if(req.body.author) { delete req.body.author; } // not allowed

  req.body.categories = req.body.categories.map(function(cat) {
    return _.has(cat, '_id') ? cat._id : cat;
  });

  List.findById(req.params.id)
  .populate({ path: 'categories author', select: '_id name email' })
  .exec(function(err, list) {
    if (err) { return helpers.handleError(res, err); }
    if (!list) { return res.send(404); }

    var wasActive = _.clone(list.active);
    _.assign(list, req.body);

    if (typeof list.active !== 'undefined' && list.active !== wasActive) {
      var mandrill = require('../../components/mail/mandrill.service');
      var message;
      if (list.active) {
        message = 'The list :title has been un-blocked.';
      } else {
        message = 'The list :title has been blocked because it does not comply with community standards.  If you have questions, you may reply to the site administrator.'.replace(/:title/, list.title);
      }
      tracer.debug(list.author);
      var to = [{
        email: list.author.email,
        name: list.author.name
      }];
      mandrill.send(to, list.title, message);
    }
    tracer.log('updating');
    tracer.log(list);
    list.save(function (err) {
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
