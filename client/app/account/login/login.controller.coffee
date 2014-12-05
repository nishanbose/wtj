'use strict'

angular.module 'wtjApp'
.controller 'LoginCtrl', ($scope, $location, $state, $window, $modal, flash, Auth, ResetPwService, listService) ->
  $scope.user = {}
  $scope.errors = {}

  $scope.resetPw = ResetPwService.resetPw

  $scope.loginOauth = (provider) ->
    $window.location.href = '/auth/' + provider
  
  linknotfound = $location.search()['linknotfound']

  if linknotfound
    flash.warn = 'That link may have expired. You may try to reset your password again.'
    $location.search 'linknotfound', null

  $scope.login = (form) ->
    $scope.submitted = true
    return unless form.$valid

    Auth.login
      email: $scope.user.email
      password: $scope.user.password

    .then (result) ->
      if _.has(result, 'token') && (listId = listService.deferredVoteListId())
        listService.voteDeferredList listId, ->
          $state.go 'list', { id: listId }
      else        
        $state.go 'main'

    .catch (err) ->
      $scope.errors.other = err.message

