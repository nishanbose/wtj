'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var gen_password = require('password-generator');

var ResetpwSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  key: { type: String, index: true, default: gen_password(48, false) },
  messageKey: String, // Mandrill API key of mail message.
  createdAt: { type: Date, expires: '24h', default: new Date() }
});

module.exports = mongoose.model('Resetpw', ResetpwSchema);
