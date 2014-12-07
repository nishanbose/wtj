'use strict'

angular.module 'wtjApp'
.directive 'fbShare', ->
  templateUrl: 'app/fbshare/fbshare.html'
  restrict: 'EA'
  link: (scope, element, attrs) ->
