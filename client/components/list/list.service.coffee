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

      console.log list
      list.datePretty = (new Date(list.createdAt)).toDateString()
      list.author ||= {}
      list.categories ||= []
      list
