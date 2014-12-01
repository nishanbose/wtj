'use strict'

# Controller for a single list
angular.module 'wtjApp'
.controller 'ListCtrl', ($scope, $state, $modal, $http, $q, Complaint, List, Vote, Auth, Modal, flash, listService) ->
  $scope.canEdit = false
  $scope.canDelete = false
  $scope.canBlock = Auth.isAdmin()
  $scope.canFeature = Auth.isAdmin()
  $scope.votes = []
  $scope.alreadyVoted = false

  $scope.list = List.get { id: $state.params.id }, (list) ->
    listService.decorate list
    user = Auth.getCurrentUser()

  $q.all({list: $scope.list.$promise, user: Auth.getCurrentUser().$promise}).then (results) ->
    $scope.canEdit = results.user && results.user._id && results.list.author._id == results.user._id
    $scope.canDelete = results.user && results.user_id && (results.user.role == 'admin' || results.list.author._id == results.user._id)
    
  $scope.votes = Vote.query { list: $state.params.id }, (votes) ->
    user = Auth.getCurrentUser()
    if user.$promise
      user.$promise.then (user) ->
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

  $scope.toggleActive = ->
    $scope.list.active = !$scope.list.active
    $scope.list.$update ->
      flash.success = 'List is ' + (if $scope.list.active then 'published.' else 'blocked.')

  $scope.toggleFeatured = ->
    $scope.list.featured = !$scope.list.featured
    $scope.list.$update ->
      flash.success = 'List is ' + (if $scope.list.featured then 'featured.' else 'no longer featured.')

  $scope.delete = ->
    del = ->
      $scope.list.$remove ->
        flash.success = 'You have deleted your list ' + $scope.list.title
        $state.go('my-lists')
      , (headers) ->
        flash.error = headers.message
    Modal.confirm.delete(del) $scope.list.title

  $scope.complain = ->
    modal = $modal.open
      templateUrl: 'components/modal/complain.html'
      controller: ($scope, $modalInstance) ->
        # $scope.submitted = false
        $scope.data =
          reason: ''
          email: ''

        $scope.submit = (form) ->
          # $scope.submitted = true
          # console.log form
          $modalInstance.close $scope.data
      dismissable: true
    , 'modal-warning'

    modal.result.then (data) ->
      # console.log data
      if data.reason
        Complaint.save _.assign(data, { list: $scope.list._id }), ->
          flash.success = 'Thank you.  The site admin will be notified.'
        , (headers) ->
          flash.error = headers.message
      else
        flash.warn = 'You did not give a reason for your complaint.  You may try again.'
