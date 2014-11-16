angular.module 'wtjApp'
.directive 'mailTo', ->
  restrict: 'E'
  scope:
    name: '@'
    email: '@'
  template: '<a href="mailto:{{email}}">{{name}}</a>'
