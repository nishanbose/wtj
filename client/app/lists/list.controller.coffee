'use strict'

# Controller for a single list
angular.module 'wtjApp'
.controller 'ListCtrl', ($scope, $state, List, Vote, Auth, Modal, flash, listService) ->
  $scope.canEdit = false
  $scope.canDelete = false
  $scope.canBlock = Auth.isAdmin()
  $scope.votes = []
  $scope.alreadyVoted = false

  $scope.list = List.get { id: $state.params.id }, (list) ->
    listService.decorate list
    user = Auth.getCurrentUser()
    $scope.canEdit = list.author._id == user._id
    $scope.canDelete = user.role == 'admin' || list.author._id == user._id

  $scope.votes = Vote.query { list: $state.params.id }, (votes) ->
    user = Auth.getCurrentUser()
    if user
      for vote in votes
        if vote.user._id == user._id
          $scope.alreadyVoted = true
          break

  $scope.edit = ->
    $state.go 'list-edit', { id: $state.params.id }

  $scope.vote = (list) ->
    listService.vote list._id, (vote) ->
      $scope.alreadyVoted = true
      $scope.votes.push vote if vote

  $scope.delete = ->
    del = ->
      $scope.list.$remove ->
        flash.success = 'You have deleted your list ' + $scope.list.title
        $state.go('my-lists')
      , (headers) ->
        flash.error = headers.message
    Modal.confirm.delete(del) $scope.list.title

  $scope.toggleActive = ->
    $scope.list.active = !$scope.list.active
    $scope.list.$update ->
      flash.success = 'List is ' + (if $scope.list.active then 'published.' else 'blocked.')
