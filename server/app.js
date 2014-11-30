/**
 * Main application file
 */

'use strict';

var tracer = require('tracer').console({ level: 'info' });

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
tracer.info('NODE_ENV=' + process.env.NODE_ENV);

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');
tracer.debug(config);

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { 
  var async = require('async');
  var Seed = require('./config/seed');
  async.series([
    function(callback) { Seed.createUsers(10, callback) },
    function(callback) { Seed.createCategories(5, callback) },
    function(callback) { Seed.createLists(30, callback) }
    ], function(err, results) {
      if (err) {
        tracer.error(err);
        throw new Error('Failed to seed database.')
      }
      var users = results[0];
      var cats = results[1];
      var lists = results[2];
      var tracer2 = require('tracer').console({ level: 'warn' });
      tracer2.log(users);
      tracer2.log(cats);
      Seed.assignListCategoriesAndAuthors(lists, cats, users, function(err, newLists) {
        if (err) { tracer2.error(err); }
        tracer2.log(newLists);
      });
  });
}

// Setup server
var app = express();
var server = require('http').createServer(app);
var socketio = require('socket.io')(server, {
  serveClient: (config.env === 'production') ? false : true,
  path: '/socket.io-client'
});
require('./config/socketio')(socketio);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
