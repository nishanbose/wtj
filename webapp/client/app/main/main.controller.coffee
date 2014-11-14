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
.controller 'MainCtrl', ($scope, Category, List) ->
  $scope.categories = Category.query()
  $scope.lists = List.query({ top: 3 })
