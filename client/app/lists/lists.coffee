'use strict'

angular.module 'wtjApp'
.config ($stateProvider) ->
  
  $stateProvider.state 'lists',
    url: '/lists?category&author&featured'
    templateUrl: 'app/lists/index/index.html'
    controller: 'ListIndexCtrl'

  $stateProvider.state 'my-lists',
    url: '/lists/me'
    templateUrl: 'app/lists/index/index.html'
    controller: 'ListIndexCtrl'
  
  $stateProvider.state 'list',
    url: '/lists/:id'
    templateUrl: 'app/lists/list.html'
    controller: 'ListCtrl'

  $stateProvider.state 'list-edit',
    url: '/lists/:id/edit'
    templateUrl: 'app/lists/edit/edit.html'
    controller: 'ListEditCtrl'
