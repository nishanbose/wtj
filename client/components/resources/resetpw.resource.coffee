'use strict'

angular.module 'wtjApp'
.factory 'ResetPwApi', ($resource) ->
  $resource '/api/resetpw/:key', {},

  save:
    method: 'POST'

  reset:
    method: 'GET'

