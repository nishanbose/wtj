'use strict'

angular.module 'wtjApp'
.service 'listService', ($q, $state, $cookieStore, $sce, flash, Auth, Vote) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function

  self =
    # Add .updatedPretty
    decorate: (list) ->
      # console.log typeof(list)
      if !list
        throw 'listService.decorate(): null argument'

      # console.log list
      list.datePretty = (new Date(list.createdAt)).toDateString()
      list.author ||= {}
      list.categories ||= []
      list

    # callback(vote) - new vote
    vote: (listId, callback) ->
      # If volunteer is not yet authenticated, remember his intent and redirect him to /login.
      Auth.isLoggedInAsync (isLoggedIn) ->
        if !isLoggedIn
          self.voteAfterLogin listId
          return $state.go('login')

        params = { user: Auth.getCurrentUser()._id, list: listId } # query params

        Vote.query params, (votes) ->
          if votes.length > 0
            flash.success = $sce.trustAsHtml 'You have already liked this list.  We\'e glad you like it so much!'
            $state.go('list', { id: listId })
            return callback?(false)
            
          vote = new Vote(params)
          vote.$save (data, headers) ->
            callback?(data)
            flash.success = $sce.trustAsHtml 'We\'re glad you like it!'
            $state.go('list', { id: listId })
          , (headers) ->
            callback?(false)
            flash.error = headers.message

    # Return list id that user tried to vote for
    # before being redirected to /login page.
    # fn() gets, fn(val) sets, and fn(null) clears the value.
    voteAfterLogin: ->
      key = 'after-login-votefor-list'

      if arguments.length > 0
        if arguments[0]
          $cookieStore.put key, arguments[0]
        else
          $cookieStore.remove key
      else
        $cookieStore.get key
