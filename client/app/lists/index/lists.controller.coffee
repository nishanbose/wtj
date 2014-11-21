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
.controller 'ListsCtrl', ($scope, $state, $sce, List, Category, User, Auth, listService) ->
  $scope.title = 'Lists'
  $scope.trust = $sce.trustAsHtml
  $scope.canCreate = $state.is 'my-lists'  # Use can create a new list
  query = {}
  title_elements = []

  # Set page header
  if $state.params.category
    query.category = $state.params.category

    Category.get { id: $state.params.category }, (cat) ->
      title_elements.push cat.name
      $scope.title = title_elements.join('<br />')

  if $state.is 'my-lists'
    query.author = Auth.getCurrentUser()._id
  else if $state.params.author
    query.author = $state.params.author

  if query.author
    User.get { id: query.author }, (user) ->
      title_elements.push(if $state.is 'my-lists' then 'My Lists' else user.name)
      $scope.title = title_elements.join('<br />')

  if $state.params.featured
    query.featured = $state.params.featured
    
  $scope.lists = List.query query, (lists) ->
    # console.log lists
    listService.decorate list for list in lists

  $scope.newList = ->
    $state.go('list-edit', { id: 'new' })

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
