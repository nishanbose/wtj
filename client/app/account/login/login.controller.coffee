'use strict'

angular.module 'wtjApp'
.controller 'LoginCtrl', ($scope, $location, $state, $window, Auth, listService) ->
  $scope.user = {}
  $scope.errors = {}
  $scope.login = (form) ->
    $scope.submitted = true
    return unless form.$valid

    Auth.login
      email: $scope.user.email
      password: $scope.user.password

    .then (result) ->
      if _.has(result, 'token') && (listId = listService.deferredVoteListId())
        listService.voteDeferredList listId
        $state.go 'list', { id: listId }
      else        
        $state.go 'main'

    .catch (err) ->
      $scope.errors.other = err.message

  $scope.loginOauth = (provider) ->
    $window.location.href = '/auth/' + provider
