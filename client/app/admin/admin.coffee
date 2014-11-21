'use strict'

angular.module 'wtjApp'
.config ($stateProvider) ->

  $stateProvider
  .state 'admin-accounts',
    url: '/admin/accounts'
    templateUrl: 'app/admin/accounts/index.html'
    controller: 'AdminAccountCtrl'

  $stateProvider
  .state 'admin-categories',
    url: '/admin/categories'
    templateUrl: 'app/admin/categories/index.html'
    controller: 'AdminCategoriesIndex'

  $stateProvider
  .state 'admin-category',
    url: '/admin/categories/:id'
    templateUrl: 'app/admin/categories/edit.html'
    controller: 'AdminCategoryEdit'
