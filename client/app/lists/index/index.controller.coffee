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
.controller 'ListIndexCtrl', ($scope, $state, $q, List, Category, User, Auth, listService) ->
  # console.log $state.params
  $scope.title = 'Lists'
  $scope.canCreate = false  # Use can create a new list
  
  Auth.isLoggedInAsync (isLoggedIn) ->
    if $state.is('my-lists') && !isLoggedIn
      $state.go('login')
      return
    $scope.canCreate = isLoggedIn

  genListTitle = ->
    title_elements=[]
    title = ''
    promises = {}

    if $state.is 'my-lists'
      title_elements.push 'My Lists'
    else if $state.params.author
      user = User.get { id: $state.params.author }
      promises.user = user.$promise
    
    if $state.params.category
      cat = Category.get { id: $state.params.category }
      promises.cat = cat.$promise

    $q.all(promises).then (result) ->
      # FIXME - then returns before result.cat and result.user are resolved
      title_elements.push result.cat.name if result.cat
      title_elements.push result.user.name if result.user

      if title_elements.length > 0
        $scope.title = title_elements.join(', ')
      else
        $scope.title = 'Lists'
    , (reason) ->
      flash.error = 'An error occured: ' + reason

  genQuery = ->
    query = {}
    cat = $q.when(false)
    user = $q.when(false)
    query={}

    if $state.is 'my-lists'
      if !Auth.isLoggedIn()
        $state.go('login')
        return
      query.author = Auth.getCurrentUser()._id
    else if $state.params.author
      query.author = $state.params.author
      user = User.get { id: $state.params.author }
    
    if $state.params.category
      query.category = $state.params.category
      cat = Category.get { id: $state.params.category }

    if $state.params.featured
      query.featured = $state.params.featured

    query

  updateLists = ->
    query = _.assign { order: $scope.order }, genQuery()
    console.log query
    $scope.lists = List.query query, (lists) ->
      $scope.lists = listService.censor lists
      listService.decorate list for list in lists

  $scope.newList = ->
    List.save (list) ->
      author: Auth.getCurrentUser()._id
      $state.go('list-edit', { id: list._id })
    , (headers) ->
      flash.error = headers.message

  $scope.goToListForCategory = (catId) ->
    $state.go 'lists', { category: catId }

  $scope.canDisplay = (list, index) ->
    # console.log list
    Auth.isAdmin() || list.active

  genListTitle()
  $scope.order = 'recent'
  updateLists()

  $scope.$watch 'order', (order, oldVal) ->
    if order != oldVal
      updateLists()


  # $scope.gridOptions = 
  #   data: 'lists'
  #   enableRowSelection: false
  #   enableCellSelection: false
  #   sortInfo: { fields: ['updatedAt'], directions: ['desc'] }
  #   columnDefs: [
  #     {
  #       field: 'title'
  #       displayName: 'Title'
  #       cellTemplate: 'app/lists/index/title-cell-link.html'
  #       sortable: true
  #     }
  #     {
  #       field: 'author'
  #       displayName: 'Author'
  #       cellTemplate: 'app/lists/index/author-cell-link.html'
  #       sortable: true
  #     }
  #     { field: 'updatedPretty', displayName: 'Updated', sortable: true, sortFn: compareDate }
  #     # { field: 'owner', displayName: 'Submitted By', sortable: true }
  #     {
  #       field: 'categories'
  #       displayName: 'Categories'
  #       cellTemplate: 'app/lists/index/categories-cell.html'
  #       sortable: false
  #     }
  #   ]
