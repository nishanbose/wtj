'use strict';

var _ = require('lodash');
var Vote = require('./vote.model');
var auth = require('../../auth/auth.service');
var helpers = require('../helpers.service');

// Get list of votes
exports.index = function(req, res) {
  Vote.find(req.query)
  .populate({ path: 'user list', select: '_id email title' })
  .exec(function (err, votes) {
    if(err) { return helpers.handleError(res, err); }
    return res.json(200, votes);
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
  // var tracer = require('tracer').console({ level: 'warn' });
  if (!_.has(req.body, 'user') || !_.has(req.body, 'list')) {
    return res.send(400, 'Missing user or list id');
  }
  async.parallel([
    function(callback) { User.findById(req.body.user, callback) },
    function(callback) { List.findById(req.body.list, callback) },
    function(callback) { Vote.find(req.body, callback) }
    ], function(err, results) {
      if(err) { return helpers.handleError(res, err); }

      var userId = results[0];
      var listId = results[1];
      var votes = results[2];

      if (!userId) { return res.send(400, 'No user for _id=' + req.body.user); }
      if (!listId) { return res.send(400, 'No list for _id=' + req.body.list); }
      if (votes.length > 0) {
        return res.send(403,
          'User :userId already voted for list :listId.'
          .replace(/:userId/, userId)
          .replace(/:listId/, listId)); 
      }
      Vote.create({ user: userId, list: listId }, function(err, vote) {
        if(err) { return helpers.handleError(res, err); }

        List.update({ _id: listId }, { $inc: { nVotes: 1}}, function(err, numAffected, raw) {
          if(err) { return helpers.handleError(res, err); }
          return res.json(201, vote);
        });
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
