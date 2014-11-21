'use strict';

var mongoose = require('mongoose'),
    timestamps = require('mongoose-timestamp'),
    Schema = mongoose.Schema;

var VoteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  list: { type: Schema.Types.ObjectId, ref: 'List', index: true }
});

VoteSchema.index({ volunteer: 1, event: 1 }, { unique: true });
VoteSchema.plugin(timestamps);

module.exports = mongoose.model('Vote', VoteSchema);
