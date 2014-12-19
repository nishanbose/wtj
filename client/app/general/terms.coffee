'use strict'

angular.module 'wtjApp'
.config ($stateProvider) ->
  $stateProvider
  .state 'terms',
    url: '/terms'
    templateUrl: 'app/general/terms.html'