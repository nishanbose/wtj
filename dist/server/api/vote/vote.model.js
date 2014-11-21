'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

var VoteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  list: { type: Schema.Types.ObjectId, ref: 'List', index: true }
});

VoteSchema.plugin(timestamps);
VoteSchema.index({ user: 1, list: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);
