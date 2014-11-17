'use strict'

compareDate = (_a, _b) ->
  a = new Date(_a)
  b = new Date(_b)
  a - b
  # if a < b then return -1
  # if a > b then return 1
  # return 0

angular.module 'wtjApp'

# Controller for a listing of lists.
.controller 'ListsCtrl', ($scope, $state, List, Category, User, listService) ->
  $scope.title = 'Lists'
  query = {}

  if $state.params.category
    query.category = $state.params.category

    Category.get { id: $state.params.category }, (cat) ->
      # console.log(cat)
      $scope.title = 'Lists Matching ' + cat.name

  if $state.params.author
    query.author = $state.params.author

    User.get { id: $state.params.author }, (user) ->
      # console.log(cat)
      $scope.title = 'Lists Authored by ' + user.name

  $scope.lists = List.query query, (lists) ->
    # console.log lists
    listService.decorate list for list in lists

  $scope.gridOptions = 
    data: 'lists'
    enableRowSelection: false
    enableCellSelection: false
    sortInfo: { fields: ['updatedAt'], directions: ['desc'] }
    columnDefs: [
      {
        field: 'title'
        displayName: 'Title'
        cellTemplate: 'app/lists/index/title-cell-link.html'
        sortable: true
      }
      {
        field: 'author'
        displayName: 'Author'
        cellTemplate: 'app/lists/index/author-cell-link.html'
        sortable: true
      }
      { field: 'datePretty', displayName: 'Updated', sortable: true, sortFn: compareDate }
      # { field: 'owner', displayName: 'Submitted By', sortable: true }
      {
        field: 'categories'
        displayName: 'Categories'
        cellTemplate: 'app/lists/index/categories-cell.html'
        sortable: false
      }
    ]

  $scope.goToListForCategory = (catId) ->
    $state.go('lists', { category: catId })

# Controller for a single list
.controller 'ListCtrl', ($scope, List, $state, listService) ->
  $scope.list = List.get { id: $state.params.id }, (list) ->
    listService.decorate list
