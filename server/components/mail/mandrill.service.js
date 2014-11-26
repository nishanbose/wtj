'use strict';

var _ = require('lodash');
var mandrill = require('mandrill-mail');
var FROM_EMAIL = 'admin@experiencejackson.com';
var FROM_NAME = 'Admin';
var API_KEY = '4pZAUZFRRLEpADzvuoWL-g';


exports.send = function(to, subj, html) {
  var tracer = require('tracer').console({ level: 'log' });
  tracer.info('sending mail');
  tracer.info(to);
  tracer.info(subj);
  var params = {
    to: to,
    subject: subj,
    html: html,
    from_email: FROM_EMAIL,
    from_name: FROM_NAME
  };
  mandrill.send(API_KEY, params, function(json) {
    tracer.log(json);
  });
};
