'use strict';

// var mongoose = require('mongoose');
// var passport = require('passport');
// var config = require('../config/environment');
// var jwt = require('jsonwebtoken');
// var expressJwt = require('express-jwt');
// var compose = require('composable-middleware');
// var User = require('../api/user/user.model');
// var validateJwt = expressJwt({ secret: config.secrets.session });
var _ = require('lodash')
var tracer = require('tracer').console({ level: 'info' });
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

function processQuery(_query) {
  var query = _.cloneDeep(_query);
  tracer.debug(query);
  for (var key in query) {
    if (_.isArray(query[key])) {
      query[key] = (key === '_id[]') ? { $in: query[key].map(toObjectId) } : { $in: query[key] };
    }
  }
  tracer.debug(query);
  return query;
}

function handleError(res, err) {
  tracer.warn(err);
  return res.send(500, err);
}

function toObjectId(id) { 
  return Schema.Types.ObjectId(id)
}

exports.processQuery = processQuery;
exports.handleError = handleError;
exports.toObjectId = toObjectId;
