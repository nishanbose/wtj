'use strict'

angular.module 'wtjApp'
.service 'ResetPwService', ($modal, ResetPwApi, flash) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function

  resetPw: ->
    $modal.open
      templateUrl: 'components/modal/resetpw.html'
      controller: ($scope, $modalInstance) ->
        $scope.data =
          email: ''

        $scope.submit = (form) ->
          $modalInstance.close $scope.data
      dismissable: true
    , 'modal-warning'
    .result.then (data) ->
      if data.email.length > 0
        ResetPwApi.save { email: data.email }, ->
          flash.success = 'Please check your e-mail.'
        , (headers) ->
          if headers.status == 404
            flash.warn = "That e-mail address is not registered.  You may need to sign up."
          else
            flash.error = headers.message
      else
        flash.warn = 'You did not give an email address.  You may try again.'

