'use strict'

# Controller for editing a list
angular.module 'wtjApp'
.controller 'ListEditCtrl', ($scope, $state, flash, Auth, List, Category, listService) ->
  $scope.message = ''
  $scope.isAdmin = Auth.getCurrentUser().role == 'admin'
  $scope.list = listService.decorate {}
  $scope.list_master = angular.copy $scope.list
  # console.log Auth.getCurrentUser()

  $scope.list = List.get { id: $state.params.id }, (list) ->
    # $scope.list.items.length = 0
    # $scope.list.items.push = { val: item } for item in list.items # http://jsfiddle.net/sirhc/z9cGm/
    listService.decorate list
    list.items = ({ val: item } for item in list.items)  # http://jsfiddle.net/sirhc/z9cGm/
    angular.copy list, $scope.list_master
    # console.log($scope.list_master)
  , (headers) ->
    flash.error = headers.message
  
  $scope.categories = Category.query()

  $scope.isChanged = (form) ->
    !angular.equals $scope.list_master, $scope.list

  $scope.appendItem = ->
    $scope.list.items.push { val: '' }

  $scope.removeItem = (i) ->
    delete $scope.items[i]

  $scope.reset = (form) ->
    angular.copy $scope.list_master, $scope.list

  $scope.submit = (form) ->
    $scope.submitted = true
    return unless form.$valid

    list = angular.copy $scope.list
    list.items = (item.val for item in list.items)
    list.$update ->
      $state.go('list', { id: $state.params.id })
    , (headers) ->
      flash.error = headers.message
  
  $scope.dragControlListeners =
    accept: (sourceItemHandleScope, destSortableScope) ->
      true    
    containment: '#edit-list-items' # optional
