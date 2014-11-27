/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Complaint = require('./complaint.model');

exports.register = function(socket) {
  Complaint.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Complaint.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('complaint:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('complaint:remove', doc);
}