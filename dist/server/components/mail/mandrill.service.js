'use strict';

var _ = require('lodash');
var API_KEY = '4pZAUZFRRLEpADzvuoWL-g';
var mandrill_api = require('mandrill-api/mandrill')
var mandrill = new mandrill_api.Mandrill(API_KEY);
var FROM_EMAIL = 'admin@experiencejackson.com';
var FROM_NAME = 'Admin';

exports.send = function(to, subj, html) {
  var tracer = require('tracer').console({ level: 'log' });
  tracer.info('sending mail');
  tracer.info(to);
  tracer.info(subj);
  var params = {
    message: {
      to: to,
      subject: subj,
      html: html,
      from_email: FROM_EMAIL,
      from_name: FROM_NAME
    }
  };
  mandrill.messages.send(params, function(err, res) {
    if (err) {
      tracer.error(JSON.stringify(err));
    } else {
      tracer.log(res);
    }
  });
};
