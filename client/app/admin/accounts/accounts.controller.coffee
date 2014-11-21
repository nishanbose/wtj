'use strict'

angular.module 'wtjApp'
.controller 'AdminAccountCtrl', ($scope, $http, flash, Modal, User) ->

  $scope.users = User.query { role: 'user' }, (users) ->
    for i in [0 .. users.length-1]
      do (i) ->
        $scope.$watch 'users[:i].active'.replace(/:i/, i), (active, oldVal) ->
          if active != oldVal
            users[i].$update ->
              message = ':verb account :email'
              .replace(/:verb/, if active then 'Activated' else 'Deactivated')
              .replace(/:email/, users[i].email)
              flash.success = message
            , (headers) ->
              flash.error = headers.message

  $scope.delete = (user) ->
    return if user._id == 'new'

    del = ->
      user.$remove ->
        _.remove $scope.users, user
        flash.success = 'You have deleted :email.'.replace(/:email/, user.email)
      , (headers) ->
        flash.error = headers.message
    Modal.confirm.delete(del) user.email
