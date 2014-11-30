'use strict'

angular.module 'wtjApp'
.controller 'LoginCtrl', ($scope, $location, $state, $window, $modal, flash, Auth, ResetPw, listService) ->
  $scope.user = {}
  $scope.errors = {}

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

  $scope.loginOauth = (provider) ->
    $window.location.href = '/auth/' + provider

  $scope.resetPw = ->
    $modal.open
      templateUrl: 'components/modal/resetpw.html'
      controller: ($scope, $modalInstance) ->
        # $scope.submitted = false
        $scope.data =
          email: ''

        $scope.submit = (form) ->
          # $scope.submitted = true
          # console.log form
          $modalInstance.close $scope.data
      dismissable: true
    , 'modal-warning'
    .result.then (data) ->
      console.log data
      if data.email.length > 0
        ResetPw.save { email: data.email }, ->
          flash.success = 'Please check your e-mail.'
        , (headers) ->
          if headers.status == 404
            flash.warn = "That e-mail address is not registered.  You may need to sign up."
          else
            flash.error = headers.message
      else
        flash.warn = 'You did not give an email address.  You may try again.'
        console.log flash.warn
