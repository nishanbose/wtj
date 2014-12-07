'use strict'

###
angular.module 'wtjApp'
.controller 'MainCtrl', ($scope, $http, socket) ->
    $scope.awesomeThings = []

    $http.get('/api/things').success (awesomeThings) ->
      $scope.awesomeThings = awesomeThings
      socket.syncUpdates 'thing', $scope.awesomeThings

    $scope.addThing = ->
      return if $scope.newThing is ''
      $http.post '/api/things',
        name: $scope.newThing

      $scope.newThing = ''

    $scope.deleteThing = (thing) ->
      $http.delete '/api/things/' + thing._id

    $scope.$on '$destroy', ->
      socket.unsyncUpdates 'thing'
###
angular.module 'wtjApp'
.controller 'MainCtrl', ($scope, $state, Auth, Category, List, listService) ->
  $scope.order = 'recent'
  $scope.categories = Category.query()
  $scope.canCreate = false
  $scope.newList = listService.newList
  
  Auth.isLoggedInAsync (isLoggedIn) ->
    $scope.canCreate = isLoggedIn

  updateLists = ->
    $scope.lists = List.query { top: 200, order: $scope.order }, (lists) ->
      $scope.lists = lists.filter (list) ->
        list.active
      listService.decorate list for list in lists
    
  updateLists()

  $scope.$watch 'order', (order, oldVal) ->
    if order != oldVal
      updateLists()
