'use strict';

var _ = require('lodash');
var Complaint = require('./complaint.model');
var helpers = require('../helpers.service')

// Get list of complaints
exports.index = function(req, res) {
  Complaint.find(function (err, complaints) {
    if(err) { return helpers.handleError(res, err); }
    return res.json(200, complaints);
  });
};

// Get a single complaint
exports.show = function(req, res) {
  Complaint.findById(req.params.id, function (err, complaint) {
    if(err) { return helpers.handleError(res, err); }
    if(!complaint) { return res.send(404); }
    return res.json(complaint);
  });
};

// Creates a new complaint in the DB.
exports.create = function(req, res) {
  Complaint.create(req.body, function(err, complaint) {
    if(err) { return helpers.handleError(res, err); }
    return res.json(201, complaint);
  });
};

exports.upsert = function(req, res) {
  var tracer = require('tracer').console({ level: 'warn' });
  var List = require('../list/list.model');
  var User = require('../user/user.model');
  var mandrill = require('../../components/mail/mandrill.service');
  var listId = req.body.list;

  if (!listId) {
    tracer.error('missing list-id');
    return res.status(400).send('Missing list-id');
  }

  if (!req.ip) {
    tracer.error('missing req.ip');
    return res.status(400).send('Missing arguments: list and/or req.ip');
  }

  List.findById(listId, function(err, list) {
    if(err) { return helpers.handleError(res, err); }
    if (!list) { return res.status(404).send('List not found'); }
    
    var query = {
      list: listId,
      source: req.ip
    };
    
    var complain = function(cb) {
      Complaint.findOneAndUpdate(query, { reason: req.body.reason }, { upsert: true }, function(err) {
        if (err) { return helpers.handleError(res, err); }
        cb(err);
      });
    };

    var notify = function(done) {
      User.findById(list.author, function(err, user) {
        if (err) { return helpers.handleError(res, err); }

        var to = [{
          email: 'admin@experiencejackson.com',
          name: 'Admin'
        }];

        if (user) {
          to.push({
            email: user.email,
            name: user.name
          });
        }
        var subject = 'Complaint: ' + list.title;
        var url = req.headers.host + '/lists/' + list._id;
        var link = '<a href="http://:url">:title</a>'
        .replace(/:url/, url)
        .replace(/:title/, list.title);

        var message = 'Someone has complained about the list ":title" authored by :name.'
        .replace(/:title/, list.title)
        .replace(/:name/, user ? user.name : 'unknown author');

        mandrill.send(to, subject, message, done);
      });
    };
    var async = require('async');
    async.parallel([
      function(cb) { complain(cb); },
      function(cb) { notify(cb); },
      ], function(err) {
        res.send(204);
      })
  });
};

// Updates an existing complaint in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Complaint.findById(req.params.id, function (err, complaint) {
    if (err) { return helpers.handleError(res, err); }
    if(!complaint) { return res.send(404); }
    var updated = _.merge(complaint, req.body);
    updated.save(function (err) {
      if (err) { return helpers.handleError(res, err); }
      return res.json(200, complaint);
    });
  });
};

// Deletes a complaint from the DB.
exports.destroy = function(req, res) {
  Complaint.findById(req.params.id, function (err, complaint) {
    if(err) { return helpers.handleError(res, err); }
    if(!complaint) { return res.send(404); }
    complaint.remove(function(err) {
      if(err) { return helpers.handleError(res, err); }
      return res.send(204);
    });
  });
};
