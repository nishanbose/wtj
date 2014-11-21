'use strict'

# Controller for editing a list
angular.module 'wtjApp'
.controller 'ListEditCtrl', ($scope, $state, flash, Auth, List, Category, listService) ->
  $scope.message = ''
  $scope.isAdmin = Auth.getCurrentUser().role == 'admin'
  console.log Auth.getCurrentUser()

  if !$state.params.id || $state.params.id == 'new'
    $scope.list = listService.decorate(new List)
  else
    $scope.list = List.get { id: $state.params.id }, (list) ->
      listService.decorate list
      $scope.list.items = ( { val: item } for item in list.items ) # http://jsfiddle.net/sirhc/z9cGm/
      $scope.list_master = angular.copy($scope.list)
    , (headers) ->
      flash.error = headers.message
  
  $scope.list_master = angular.copy($scope.list)
  $scope.categories = Category.query()

  $scope.appendItem = ->
    $scope.list.items.push { val: '' }

  $scope.removeItem = (i) ->
    delete $scope.items[i]

  $scope.reset = (form) ->
    $scope.list = angular.copy($scope.list_master)

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
