'use strict';
var tracer = require('tracer').console({ level: 'log' });

// http://stackoverflow.com/a/24638042/270511
var argv = require('minimist')(process.argv.slice(2));
var email = argv._[0];
var validator = require('validator');

if (!email) {
  console.log('Usage: [NODE_ENV=env] resetUser [--role=role] [--name=name] email');
  console.log("    where env is one of 'test' (default), 'development', or 'production'");
  process.exit(1);
}

if (!validator.isEmail(email)) {
  console.log("':email' is not a valid email address.".replace(/:email/, email));
  process.exit(1);
}

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
tracer.info('NODE_ENV=' + process.env.NODE_ENV);

var gen_password = require('password-generator');
var mongoose = require('mongoose');
var config = require('./server/config/environment');
var User = require('./server/api/user/user.model');

var params = {
  active: true
};

if (argv.name) {
  params.name = argv.name;
}

if (argv.role) {
  params.role = argv.role;
}

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

User.findOneAndUpdate({
  provider: 'local',
  email: email,
}, params, { upsert: true }, function(err, user) {
  // tracer.debug(arguments);
  if (err) { 
    tracer.error(err); 
    process.exit(1);
  }
  var password = gen_password();
  user.password = password;
  user.save(function(err, user) {
    tracer.log(user);
    if (err) {
      tracer.error(err);
      process.exit(1);
    }
    console.log('Reset/created account ' + user.email);
    console.log("Password set to ':password'".replace(/:password/, password));
    console.log('Please note these settings.')
    process.exit();
  });
});
