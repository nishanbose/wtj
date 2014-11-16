'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ListSchema = new Schema({
  title: String,
  about: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  items: [ String ],
  active: Boolean
});

var timestamps = require('mongoose-timestamp')
ListSchema.plugin(timestamps);

module.exports = mongoose.model('List', ListSchema);
