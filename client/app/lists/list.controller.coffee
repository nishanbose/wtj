'use strict'

# Controller for a single list
angular.module 'wtjApp'
.controller 'ListCtrl', ($scope, List, Auth, $state, listService) ->
  $scope.canEdit = false
  $scope.list = List.get { id: $state.params.id }, (list) ->
    listService.decorate list
    $scope.canEdit = list.author._id == Auth.getCurrentUser()._id
