'use strict';

var _ = require('lodash');
var Resetpw = require('./resetpw.model');
var helpers = require('../helpers.service');
var tracer = require('tracer').console({ level: 'info' });
var env = require('../../config/environment');
var title = env.title;

// Get list of resetpws
exports.index = function(req, res) {
  Resetpw.find(function (err, resetpws) {
    if(err) { return helpers.handleError(res, err); }
    return res.json(200, resetpws);
  });
};

// Reset password
// requires req.body.key
exports.resetpw = function(req, res) {
  tracer.info('resetpw()');
  tracer.debug(req.params);
  if (!req.params.key) { return res.status(400).send('Missing key'); }

  Resetpw.findOne({key: req.params.key})
  .populate('user')
  .exec(function (err, resetpw) {
    tracer.debug(resetpw);
    if(err) { return helpers.handleError(res, err); }
    if(!resetpw) { return res.redirect('/login?linkexpired=1'); }
    if(!resetpw.user) { return res.redirect('/login?linkexpired=1'); }
    var pw = require('password-generator')(32, false);
    var User = require('../user/user.model');
    User.findOneAndUpdate({ _id: resetpw.user._id }, { hashedPassword: pw }, function(err, user) {
      tracer.debug(user);
      if(err) { return helpers.handleError(res, err); }
      if (!user) { return res.redirect('/login?linkexpired=1'); }
      var auth = require('../../auth/auth.service');
      var token = auth.signToken(user._id, user.role);
      res.cookie('token', JSON.stringify(token));
      res.redirect('/settings');
      resetpw.remove();
      sendResetCompletedMessage(req, res, user, function(err) {
        if (err) {tracer.error(err); }
      });
    });
  });
};

// Creates a new resetpw in the DB.
// requires req.body.email
exports.create = function(req, res) {
  var tracer = require('tracer').console({ level: 'warn' });
  tracer.trace('Resetpw.controller create()');
  tracer.debug(req.body);
  if (!req.body.email) { return res.status(400).send('Missing email'); }
  var User = require('../user/user.model');
  User.findOne({ email: req.body.email }, function(err, user) {
    if (err) { helpers.handleError(res, err); }
    if (!user) { return res.status(404).send('Email not found') }
    Resetpw.find({ user: user })
    .remove(function(err) {
      if(err) { return helpers.handleError(res, err); }
      Resetpw.create({ user: user }, function(err, resetpw) {
        if(err) { return helpers.handleError(res, err); }
        tracer.debug(resetpw);
        sendResetPromptMessage(req, res, user, resetpw, function(err, mandrillResponse) {
          if (err) {
            tracer.error(err);
            if (process.env.NODE_ENV !== 'test') {
              return res.status(500).send(err);
            }
          }
          Resetpw.findOneAndUpdate({ _id: resetpw._id }, { messageKey: mandrillResponse[0]._id }, function(err, dbRes) {
            if (err) { 
              return res.status(500).send(err); 
            }
            return res.send(204);
          });
        });
      });
    });
  });
};

// // Updates an existing resetpw in the DB.
// exports.update = function(req, res) {
//   if(req.body._id) { delete req.body._id; }
//   Resetpw.findById(req.params.id, function (err, resetpw) {
//     if (err) { return helpers.handleError(res, err); }
//     if(!resetpw) { return res.send(404); }
//     var updated = _.merge(resetpw, req.body);
//     updated.save(function (err) {
//       if (err) { return helpers.handleError(res, err); }
//       return res.json(200, resetpw);
//     });
//   });
// };

// // Deletes a resetpw from the DB.
// exports.destroy = function(req, res) {
//   Resetpw.findById(req.params.id, function (err, resetpw) {
//     if(err) { return helpers.handleError(res, err); }
//     if(!resetpw) { return res.send(404); }
//     resetpw.remove(function(err) {
//       if(err) { return helpers.handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };

var sendResetCompletedMessage = function(req, res, user, done) {  
  var mandrillSvc = require('../../components/mail/mandrill.service');
  var domain = '<a href="http://:host" title=":title">:title</a>'
  .replace(/:host/, req.headers.host)
  .replace(/:title/g, title);
  var mailto = '<a href="mailto:admin@experiencejackson.com">contact the site administrator</a>';
  var html = '<p>You have reset your password for :domain.  If this was not you, you should :mailto immediately.  You should also notify your e-mail provider if you think your e-mail account is being used by someone else.</p>'
  .replace(/:mailto/, mailto)
  .replace(/:domain/, domain);
  var to = [{
    name: user.name || '',
    email: user.email
  }];
  tracer.debug(html);
  mandrillSvc.send(to, 'your password', html, done);
};

var sendResetPromptMessage = function(req, res, user, resetpw, done) {
  tracer.debug(resetpw);
  var mandrillSvc = require('../../components/mail/mandrill.service');
  var link = '<a href="http://:url" title="Reset your password.">reset your password.</a>'
  .replace(/:url/, req.headers.host + '/resetpw/' + resetpw.key);
  var domain = '<a href="http://:host" title=":title">:title</a>'
  .replace(/:host/, req.headers.host)
  .replace(/:title/g, title);
  var html = '<p>You may :link for :domain.</p>'
  .replace(/:link/, link)
  .replace(/:domain/, domain);
  var to = [{
    name: user.name || '',
    email: user.email
  }];
  tracer.debug(html);
  mandrillSvc.send(to, 'your password', html, done);
};
