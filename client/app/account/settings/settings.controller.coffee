'use strict'

angular.module 'wtjApp'
.controller 'SettingsCtrl', ($scope, $state, User, Auth) ->
  $scope.errors = {}
  $scope.user =
    oldPassword: ''
    newPassword: ''
  $scope.isReset = !!$state.params.resetKey

  $scope.changePassword = (form) ->
    $scope.submitted = true

    return unless form.$valid

    if $state.params.resetKey
      Auth.resetPassword $state.params.resetKey, $scope.user.newPassword
      .then ->
        $scope.message = 'Password successfully reset.'
        $state.go('main')

      .catch ->
        form.password.$setValidity 'mongoose', false
        $scope.errors.other = 'An error occured.'
        $scope.message = ''
    else
      Auth.changePassword $scope.user.oldPassword, $scope.user.newPassword
      .then ->
        $scope.message = 'Password successfully changed.'
        $state.go('main')

      .catch ->
        form.password.$setValidity 'mongoose', false
        $scope.errors.other = 'Incorrect password'
        $scope.message = ''
