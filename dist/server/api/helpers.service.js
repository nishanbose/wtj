'use strict';

// var mongoose = require('mongoose');
// var passport = require('passport');
// var config = require('../config/environment');
// var jwt = require('jsonwebtoken');
// var expressJwt = require('express-jwt');
// var compose = require('composable-middleware');
// var User = require('../api/user/user.model');
// var validateJwt = expressJwt({ secret: config.secrets.session });
var _ = require('lodash');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

exports.processQuery = function(_query) {
  var tracer = require('tracer').console({ level: 'warn' });
  var query = _.cloneDeep(_query);
  tracer.debug(query);
  for (var key in query) {
    if (_.isArray(query[key])) {
      query[key] = (key === '_id[]') ? { $in: query[key].map(exports.toObjectId) } : { $in: query[key] };
    }
  }
  tracer.debug(query);
  return query;
};

exports.handleError = function(res, err) {
  var tracer = require('tracer').console({ level: 'info' });
  tracer.error(err);
  return res.send(500, err);
};

exports.toObjectId = function(id) { 
  return Schema.Types.ObjectId(id)
};