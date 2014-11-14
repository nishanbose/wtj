'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ListSchema = new Schema({
  title: String,
  about: String,
  items: [ String ],
  active: Boolean
});

module.exports = mongoose.model('List', ListSchema);
