'use strict'

angular.module 'wtjApp'
.factory 'List', ['$resource', ($resource) ->
  $resource '/api/lists/:id/:controller', { id: '@_id' }, {
    complain:
      method: 'PUT'
      controller: 'complain'

    update:
      method: 'PUT'
      controller: 'update'
  }
]
