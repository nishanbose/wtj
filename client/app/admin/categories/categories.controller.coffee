'use strict'

angular.module 'wtjApp'
.controller 'AdminCategoriesCtrl', ($scope, $http, flash, Category, Modal) ->

  $scope.categories = Category.query()

  $scope.delete = (category) ->
    return if category._id == 'new'

    del = ->
      category.$remove ->
        _.remove $scope.categories, category
        flash.success = 'You have deleted :name.'.replace(/:name/, category.name)
      , (headers) ->
        flash.error = headers.message
    Modal.confirm.delete(del) category.name

.controller 'AdminCategoryCtrl', ($scope, $http, flash, $state, Category) ->

  $scope.category_master = {}
  $scope.category = Category.get { id: $state.params.id }, (category) ->
    $scope.category_master = angular.copy category
  , (headers) ->
    flash.error = headers.message

  $scope.isChanged = (form) ->
    !angular.equals $scope.category, $scope.category_master

  $scope.reset = (form) ->
    $scope.category = angular.copy $scope.category_master

  $scope.submit = (form) ->
    $scope.category.$update (category) ->
      flash.success = 'Updated :name category.'.replace(/:name/, category.name)
      $state.go 'admin-categories'
    , (headers) ->
      flash.error = headers.message
