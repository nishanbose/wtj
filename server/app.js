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
  var callback = function(err, results) {
    if (err) console.log(err);
    return results;
  };
  async.series([
    function(callback) { Seed.createUsers(10, callback) },
    function(callback) { Seed.createCategories(5, callback) },
    function(callback) { Seed.createLists(30, callback) }
    ], function(err, results) {
      // console.log('async callback 1')
      if (err) { return callback(err); }

      var users = results[0];
      var cats = results[1];
      var lists = results[2];
      
      Seed.assignListCategoriesAndAuthors(lists, cats, users, function(err) {
        var results = Array.prototype.slice.call(arguments, 1);
        callback(err, results);
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
