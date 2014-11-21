'use strict'

# Controller for editing a list
angular.module 'wtjApp'
.controller 'ListEditCtrl', ($scope, $state, flash, Auth, List, Category, listService) ->
  $scope.message = ''
  $scope.isAdmin = Auth.getCurrentUser().role == 'admin'
  $scope.list_master = {}
  # console.log Auth.getCurrentUser()

  $scope.list = List.get { id: $state.params.id }, (list) ->
    $scope.list = listService.decorate list
    if list.items
      $scope.list.items.length = 0
      $scope.list.items.push = { val: item } for item in list.items # http://jsfiddle.net/sirhc/z9cGm/
    else
      $scope.list.items = []
    angular.copy $scope.list, $scope.list_master
    console.log($scope.list_master)
  , (headers) ->
    flash.error = headers.message
  
  $scope.categories = Category.query()

  $scope.isChanged = (form) ->
    !angular.equals $scope.list_master, $scope.list

  $scope.appendItem = ->
    if !$scope.list.items
      $scope.list.items = []
    $scope.list.items.push { val: '' }

  $scope.removeItem = (i) ->
    delete $scope.items[i]

  $scope.reset = (form) ->
    angular.copy $scope.list_master, $scope.list

  $scope.submit = ->
    list = angular.copy($scope.list)
    list.categories = (cat._id for cat in $scope.list.categories)
    list.items = ( item.val for item in list.items when item.val.length > 0 ) # unwrap the items and skip empties
    if list._id
      list.$update()
      $state.go('list', { id: list._id })
    else
      list.$save (list) ->
        $state.go('list', { id: list._id })
  
  $scope.dragControlListeners =
    accept: (sourceItemHandleScope, destSortableScope) ->
      true;

    itemMoved: (event) ->
      # console.log event

    orderChanged: (event) ->
      # console.log event
    
    containment: '#edit-list-items' # optional
