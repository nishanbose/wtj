'use strict'

angular.module 'wtjApp'
.service 'listService', ($q) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function

  self =
    # Add .updatedPretty
    decorate: (list) ->
      # console.log typeof(list)
      if !list
        throw 'listService.decorate(): null argument'

      list.$promise ||= $q.when(list)
      list.$promise.then (list) ->
        date = new Date(list.updatedAt)
        list.datePretty = date.toDateString()
        list.categoriesPretty = (cat.name for cat in list.categories).join(', ')
      list

  self
