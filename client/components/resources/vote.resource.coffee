'use strict'

angular.module 'wtjApp'
.factory 'Vote', ['$resource', ($resource) ->
  $resource '/api/votes/:id/:controller', { id: '@_id' },

  update:
    method: 'PUT'
]
