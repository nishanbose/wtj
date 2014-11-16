/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/environment');

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { 
  var async = require('async');
  var Seed = require('./config/seed');
  var callback = function(arg) {
    if (arg) console.log(arg);
  };
  var promises = [
    Seed.createUsers(12, callback),
    Seed.createLists(30, callback),
    Seed.createCategories(5, callback)
  ];
  async.parallel(promises, function(err, results) {
    if (err) { console.log(err); return; }
    var users = results[0];
    var lists = results[1];
    var cats = results[2];
    async.parallel([
      Seed.assignListCategories(lists, cats),
      Seed.assignListAuthors(lists, users)
      ]);
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
