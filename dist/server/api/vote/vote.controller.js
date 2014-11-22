'use strict';

var _ = require('lodash');
var Vote = require('./vote.model');
var auth = require('../../auth/auth.service');
var helpers = require('../helpers.service');

// Get list of votes
exports.index = function(req, res) {
  Vote.find(req.query, function (err, votes) {
    if(err) { return helpers.handleError(res, err); }
    Vote.populate(votes, { path: 'user list', select: '_id email title' }, function(err, popVotes) {
      if(err) { return helpers.handleError(res, err); }
      return res.json(200, popVotes);
    });
  });
};

// Get a single vote
exports.show = function(req, res) {
  Vote.findById(req.params.id, function (err, vote) {
    if(err) { return helpers.handleError(res, err); }
    if(!vote) { return res.send(404); }
    return res.json(vote);
  });
};

// Creates a new vote in the DB.
exports.create = function(req, res) {
  var User = require('../user/user.model');
  var List = require('../list/list.model');
  var async = require('async');
  var tracer = require('tracer').console({ level: 'log' });
  if (!_.has(req.body, 'user') || !_.has(req.body, 'list')) {
    return res.send(400, 'Missing user or list id');
  }
  async.parallel([
    function(callback) { User.findById(req.body.user, callback) },
    function(callback) { List.findById(req.body.list, callback) },
    function(callback) { Vote.find(req.body, callback) }
    ], function(err, results) {
      if(err) { return helpers.handleError(res, err); }

      var user = results[0];
      var list = results[1];
      var votes = results[2];

      if (!user) { return res.send(400, 'No user for _id=' + req.body.user); }
      if (!list) { return res.send(400, 'No list for _id=' + req.body.list); }
      if (votes.length > 0) {
        return res.send(403,
          'User :user already voted for list :list'
          .replace(/:user/, user)
          .replace(/:list/, list)); 
      }
      Vote.create(req.body, function(err, vote) {
        if(err) { return helpers.handleError(res, err); }
        return res.json(201, vote);
      });
  });
};

/*
// Updates an existing vote in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Vote.findById(req.params.id, function (err, vote) {
    if (err) { return helpers.handleError(res, err); }
    if(!vote) { return res.send(404); }
    var updated = _.merge(vote, req.body);
    updated.save(function (err) {
      if (err) { return helpers.handleError(res, err); }
      return res.json(200, vote);
    });
  });
};
*/

// Deletes a vote from the DB.
exports.destroy = function(req, res) {
  Vote.findById(req.params.id, function (err, vote) {
    if(err) { return helpers.handleError(res, err); }
    if(!vote) { return res.send(404); }
    vote.remove(function(err) {
      if(err) { return helpers.handleError(res, err); }
      return res.send(204);
    });
  });
};
