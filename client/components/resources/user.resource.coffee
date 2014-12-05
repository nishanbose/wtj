'use strict'

angular.module 'wtjApp'
.factory 'User', ['$resource', ($resource) ->
  $resource '/api/users/:id/:controller',
    id: '@_id'
  ,
    update:
      method: 'PUT'
      
    changePassword:
      method: 'PUT'
      params:
        controller: 'password'
      
    resetPassword:
      method: 'PUT'
      params:
        controller: 'reset'

    get:
      method: 'GET'
      params:
        id: 'me'
]
