'use strict'

angular.module 'wtjApp'
.controller 'AdminCtrl', ($scope, $http, flash, User) ->

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
    User.remove id: user._id
    _.remove $scope.users, user
