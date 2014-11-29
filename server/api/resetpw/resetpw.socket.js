/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Resetpw = require('./resetpw.model');

exports.register = function(socket) {
  Resetpw.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Resetpw.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('resetpw:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('resetpw:remove', doc);
}