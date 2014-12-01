'use strict';

// constants
exports.apiKey = function() { 
  if (process.env.NODE_ENV === 'test') {
    return 'aXh9fnJDVId5AuZREf0UFw'; // test key
  }
  return '4pZAUZFRRLEpADzvuoWL-g'; // real key
};
exports.fromEmail = function() { return 'admin@experiencejackson.com'; };
exports.fromName = function() { return 'Admin'; };

var _ = require('lodash');
var mandrill_api = require('mandrill-api/mandrill')
var mandrill = new mandrill_api.Mandrill(exports.apiKey());

exports.send = function(to, subj, html, done) {
  var tracer = require('tracer').console({ level: 'info' });
  tracer.info('sending mail');
  tracer.info(to);
  tracer.info(subj);
  var params = {
    message: {
      to: to,
      subject: subj,
      html: html,
      from_email: exports.fromEmail(),
      from_name: exports.fromName()
    }
  };
  mandrill.messages.send(params, function(res) {
    tracer.log(res);
    if ({ rejected: true, invalid: true}[res.status]) { return done(res); }
    if (done) { done(null, res); }
  });
};
