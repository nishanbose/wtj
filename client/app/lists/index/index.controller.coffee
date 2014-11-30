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
.controller 'ListIndexCtrl', ($scope, $state, $sce, $q, List, Category, User, Auth, listService) ->
  $scope.title = 'Lists'
  $scope.trust = $sce.trustAsHtml
  $scope.canCreate = false  # Use can create a new list
  
  Auth.isLoggedInAsync (isLoggedIn) ->
    $scope.canCreate = isLoggedIn

  # Set up query
  do (cat = $q.when(false), user = $q.when(false), query={}, title_elements=[]) ->
    if $state.is 'my-lists'
      if !Auth.isLoggedIn()
        $state.go('login')
        return
      title_elements.push 'My Lists'
      query.author = Auth.getCurrentUser()._id
    else if $state.params.author
      query.author = $state.params.author
      user = User.get { id: $state.params.author }
    
    if $state.params.category
      query.category = $state.params.category
      cat = Category.get { id: $state.params.category }

    if (cat || user)
      $q.all({cat: cat, user: user}).then (result) ->
        # FIXME - then returns before result.cat and result.user are resolved
        title_elements.push result.cat.name if result.cat.$resolved
        title_elements.push result.user.name if result.user.$resolved
      , (reason) ->
        flash.error = 'An error occured: ' + reason

    $scope.title = title_elements.join('<br />') if title_elements.length > 0

    if $state.params.featured
      query.featured = $state.params.featured
    
    $scope.lists = List.query query, (lists) ->
      # console.log lists
      $scope.lists = listService.censor lists
      listService.decorate list for list in lists

  $scope.newList = ->
    List.save (list) ->
      author: Auth.getCurrentUser()._id
      $state.go('list-edit', { id: list._id })
    , (headers) ->
      flash.error = headers.message

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
      { field: 'updatedPretty', displayName: 'Updated', sortable: true, sortFn: compareDate }
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
