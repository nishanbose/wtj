'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
  name: String,
  about: String,
  active: Boolean
});

var timestamps = require('mongoose-timestamp')
CategorySchema.plugin(timestamps);


module.exports = mongoose.model('Category', CategorySchema);
