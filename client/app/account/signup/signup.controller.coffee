'use strict'

angular.module 'wtjApp'
.controller 'SignupCtrl', ($scope, $location, $state, $window, Auth, listService) ->
  $scope.user = {}
  $scope.errors = {}
  $scope.register = (form) ->
    $scope.submitted = true
    return unless form.$valid

    # Account created, redirect to home
    Auth.createUser
      name: $scope.user.name
      email: $scope.user.email
      password: $scope.user.password

    .then (result) ->
      if _.has(result, 'token') && (listId = listService.deferredVoteListId())
        listService.voteDeferredList listId, ->
          $state.go 'list', { id: listId }
      else        
        $state.go 'main'

    .catch (err) ->
      err = err.data
      $scope.errors = {}

      # Update validity of form fields that match the mongoose errors
      angular.forEach err.errors, (error, field) ->
        form[field].$setValidity 'mongoose', false
        $scope.errors[field] = error.message

  $scope.loginOauth = (provider) ->
    $window.location.href = '/auth/' + provider
