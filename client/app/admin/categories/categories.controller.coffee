'use strict'

angular.module 'wtjApp'
.controller 'AdminCategoriesIndex', ($scope, $http, $state, flash, Category, Modal) ->

  $scope.categories = Category.query (categories) ->
    categories.sort (a, b) ->
      return 0 if a.name == b.name
      return 1 if a.name > b.name
      return -1

    for i in [0 .. categories.length-1]
      do (i) ->
        $scope.$watch 'categories[:i].featured'.replace(/:i/, i), (featured, oldVal) ->
          if featured != oldVal
            categories[i].$update ->
              noop = 1
            , (headers) ->
              flash.error = headers.message

  $scope.new = ->
    Category.save (category) ->
      $state.go('admin-category', { id: category._id })
    , (headers) ->
      flash.error = headers.message

  $scope.delete = (category) ->
    return if category._id == 'new'

    del = ->
      category.$remove ->
        _.remove $scope.categories, category
        flash.success = 'You have deleted :name.'.replace(/:name/, category.name)
      , (headers) ->
        flash.error = headers.message
    Modal.confirm.delete(del) category.name

.controller 'AdminCategoryEdit', ($scope, $http, flash, $state, Category) ->

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
