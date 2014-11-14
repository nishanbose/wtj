'use strict'

angular.module 'wtjApp'
.factory 'List', ($resource) ->
  $resource '/api/lists/:id/:controller', { id: '@_id' },

  update:
    method: 'PUT'
