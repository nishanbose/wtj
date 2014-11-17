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

  $stateProvider.state 'edit',
    url: '/lists/:id/edit'
    templateUrl: 'app/lists/edit/edit.html'
    controller: 'ListEditCtrl'
