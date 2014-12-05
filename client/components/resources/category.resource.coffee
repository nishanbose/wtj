'use strict'

angular.module 'wtjApp'
.factory 'Category', ['$resource', ($resource) ->
  $resource '/api/categories/:id/:controller', { id: '@_id' },

  update:
    method: 'PUT'
]
