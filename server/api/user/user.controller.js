'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var auth = require('../../auth/auth.service');
var helpers = require('../helpers.service');
var tracer = require('tracer').console({ level: 'info' });
var env = require('../../config/environment');
var title = env.title;

var validationError = function(res, err) {
  tracer.warn(err);
  return res.json(422, err);
};

var permittedFields = function() {
  if (auth.hasRole('admin')) 
    return '-salt -hashedPassword';
  else if (auth.hasRole('user'))
    return '+_id +name +email';
  else
    return '+_id +name';
}
/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  var select;
  
  User.find(req.query, permittedFields(), function (err, users) {
    if(err) return res.status(500).send(err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var tracer = require('tracer').console({ level: 'warn' });
  tracer.trace('User.create()');
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    // console.log(err);
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json(201, { token: token });
  });
};

// Updates an existing user in the DB.
exports.update = function(req, res) {
  var tracer = require('tracer').console({ level: 'warn' });
  tracer.trace('User.update()');
  tracer.log(req.params);
  if(req.body._id) { delete req.body._id; }
  if(req.body.password) { delete req.body.password; }

  User.findById(req.params.id, permittedFields(), function (err, user) {
    if (err) { return helpers.handleError(res, err); }
    tracer.debug(user);
    if(!user) { return res.send(404); }
    var updated = _.merge(user, req.body);
    updated.save(function (err) {
      if (err) { return helpers.handleError(res, err); }
      return res.json(200, user);
    });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, permittedFields(), function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.status(500).send(err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(204);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Reset a users password
 */
 exports.resetPassword = function(req, res, next) {
  var Resetpw = require('../resetpw/resetpw.model');
  var newPass = String(req.body.newPassword);

  Resetpw.findOne({ key: req.body.resetKey }, function(err, resetpw) {
    if (err) { return res.status(500).send(err); }
    if (!resetpw) { return res.status(404).send('The reset key is not valid.'); }
    tracer.debug(resetpw);

    User.findById(resetpw.user, function (err, user) {
      if(err) { return res.status(500).send(err); }
      if (!user) { return res.status(404).send('Cannot find user.'); }

      tracer.debug(user);
      user.password = newPass;
      user.save(function(err) {
        if(err) { return res.status(500).send(err); }
        res.send(204);
        sendResetCompletedMessage(req, res, user, function(err) {
          if (err) { tracer.error(err); }
        });
        resetpw.remove(function(err) {
          if (err) { tracer.error(err); }
        });
      });
    });
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

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
