'use strict'

angular.module 'wtjApp'
.factory 'ResetPw', ($resource) ->
  $resource '/api/resetpw/:key', {},

  save:
    method: 'POST'

  reset:
    method: 'GET'

