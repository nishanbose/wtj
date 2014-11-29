'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var ComplaintSchema = new Schema({
  list: { type: ObjectId, ref: 'List', index: true, required: true },
  source: { type: String, index: true }, // IP of source
<<<<<<< HEAD
=======
  email: String,
>>>>>>> upstream/master
  reason: String
});

var timestamps = require('mongoose-timestamp');
ComplaintSchema.plugin(timestamps);

module.exports = mongoose.model('Complaint', ComplaintSchema);
