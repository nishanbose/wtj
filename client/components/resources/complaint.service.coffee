'use strict'

angular.module 'wtjApp'
.factory 'Complaint', ($resource) ->
  $resource '/api/complaints/:id/:controller', { id: '@_id' },

  update:
    method: 'PUT'
