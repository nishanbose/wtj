'use strict'

angular.module 'wtjApp'

# Controller for a listing of lists.
.controller 'ListsCtrl', ($scope, List) ->
  $scope.lists = List.query()

# Controller for a single list
.controller 'ListCtrl', ($scope, List, $state) ->
  $scope.list = List.get { id: $state.params.id }, (list) ->
    console.log(list)
    # list.items = list.items.split(',')
