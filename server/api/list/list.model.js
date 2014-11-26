'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var ListSchema = new Schema({
  title: String,
  about: String,
  author: { type: ObjectId, ref: 'User' },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  items: [ String ],
  featured: { type: Boolean, default: false },
  nVotes: { type: Number, default: 0 },
  complaints: [ {
    ip_address: String,
    user: ObjectId,
    date: Date
  }],
  active: { type: Boolean, default: true }
});

var timestamps = require('mongoose-timestamp')
ListSchema.plugin(timestamps);

module.exports = mongoose.model('List', ListSchema);
