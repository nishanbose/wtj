'use strict'

angular.module 'wtjApp'
.controller 'NavbarCtrl', ['$scope', '$location', 'Auth', ($scope, $location, Auth) ->
  $scope.menu = [
    {
      title: 'Home'
      link: '/'
    }
    {
      title: 'Lists'
      link: '/lists'
    }
    {
      title: 'My Lists'
      link: '/lists/me'
      role: 'user'
    }
  ]
  $scope.isCollapsed = true
  $scope.isLoggedIn = Auth.isLoggedIn
  $scope.isAdmin = Auth.isAdmin
  $scope.getCurrentUser = Auth.getCurrentUser
  $scope.isLoggedIn = Auth.isLoggedIn

  $scope.logout = ->
    Auth.logout()
    $location.path '/login'

    $scope.isActive = (route) ->
      route is $location.path()
]
