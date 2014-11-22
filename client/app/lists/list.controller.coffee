'use strict'

# Controller for a single list
angular.module 'wtjApp'
.controller 'ListCtrl', ($scope, $state, List, Vote, Auth, listService) ->
  $scope.canEdit = false
  $scope.votes = []
  $scope.alreadyVoted = false

  $scope.list = List.get { id: $state.params.id }, (list) ->
    listService.decorate list
    user = Auth.getCurrentUser()
    $scope.canEdit = user.role == 'admin' || list.author._id == user._id

  $scope.votes = Vote.query { list: $state.params.id }, (votes) ->
    user = Auth.getCurrentUser()
    if user
      for vote in votes
        if vote.user._id = user._id
          $scope.alreadyVoted = true
          break

  $scope.vote = (list) ->
    listService.vote list._id, (vote) ->
      $scope.alreadyVoted = true
      $scope.votes.push vote if vote



