'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var randomstring = require('randomstring');

var ResetpwSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  key: { type: String, index: true, default: randomstring.generate() },
  messageKey: String, // Mandrill API key of mail message.
  createdAt: { type: Date, expires: '24h', default: new Date() }
});

module.exports = mongoose.model('Resetpw', ResetpwSchema);
