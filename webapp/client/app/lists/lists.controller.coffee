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
.controller 'ListsCtrl', ($scope, List, listService) ->
  
  $scope.lists = List.query (lists) ->
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
        cellTemplate: 'app/lists/title-cell-link.html'
        sortable: true
      }
      { field: 'datePretty', displayName: 'Updated', sortable: true, sortFn: compareDate }
      # { field: 'owner', displayName: 'Submitted By', sortable: true }
      { field: 'categoriesPretty', displayName: 'Categories', sortable: false }
    ]

# Controller for a single list
.controller 'ListCtrl', ($scope, List, $state) ->
  $scope.list = List.get { id: $state.params.id }, (list) ->
    console.log(list)
    # list.items = list.items.split(',')
