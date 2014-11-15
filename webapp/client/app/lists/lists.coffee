'use strict'

angular.module 'wtjApp'
.config ($stateProvider) ->
  
  $stateProvider.state 'lists',
    url: '/lists?category'
    templateUrl: 'app/lists/lists.html'
    controller: 'ListsCtrl'
  
  $stateProvider.state 'list',
    url: '/lists/:id'
    templateUrl: 'app/lists/list.html'
    controller: 'ListCtrl'
