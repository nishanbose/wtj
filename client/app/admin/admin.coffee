'use strict'

angular.module 'wtjApp'
.config ($stateProvider) ->
  $stateProvider
  .state 'admin-accounts',
    url: '/admin/accounts'
    templateUrl: 'app/admin/accounts/index.html'
    controller: 'AdminCtrl'
