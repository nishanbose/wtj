angular.module 'wtjApp'
.directive 'listOfLists', ->
  restrict: 'E'
  scope:
    lists: '='
  templateUrl: 'components/directives/list-of-lists.html'
  # link: (scope, el, attrs) ->
  controller: ($scope, Auth) ->
    # FIXME This is not having any affect on template.
    $scope.canDisplay = (list) ->
      Auth.isAdmin() || list.active
