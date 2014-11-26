'use strict'

angular.module 'wtjApp'
.service 'listService', ($q, $state, $cookieStore, $sce, flash, Auth, Vote) ->
  # AngularJS will instantiate a singleton by calling 'new' on this function

  self =
    censor: (lists) ->
      return lists if Auth.isAdmin()
      lists.filter (list) ->
        list.active || list.author._id == Auth.getCurrentUser()._id 

    # Add .updatedPretty
    decorate: (list) ->
      # console.log typeof(list)
      if !list
        throw 'listService.decorate(): null argument'

      # console.log list
      list.updatedAt ||= new Date()
      dt = new Date(list.updatedAt)
      list.updatedPretty = dt.toDateString() + ' ' + dt.toLocaleTimeString()
      list.author ||= {}
      list.items ||= []
      list.categories ||= []
      # console.log list
      list

    # callback(vote), optional- new vote
    vote: (listId, callback) ->
      # If volunteer is not yet authenticated, remember his intent and redirect him to /login.
      Auth.isLoggedInAsync (isLoggedIn) ->
        if !isLoggedIn
          self.deferredVoteListId listId
          return $state.go('login')

        params = { user: Auth.getCurrentUser()._id, list: listId } # query params

        Vote.query params, (votes) ->
          if votes.length > 0
            flash.success = 'You have already liked this list.  We\'e glad you like it so much!'
            $state.go('list', { id: listId })
            return callback?(false)

          vote = new Vote(params)
          vote.$save (data, headers) ->
            callback?(vote)
            flash.success = 'We\'re glad you like it!'
            $state.go('list', { id: listId })
          , (headers) ->
            callback?(false)
            flash.error = headers.message

    # Return list id that user tried to vote for
    # before being redirected to /login page.
    # fn() gets, fn(val) sets, and fn(null) clears the value.
    deferredVoteListId: ->
      key = 'after-login-votefor-list'

      if arguments.length > 0
        if arguments[0]
          $cookieStore.put key, arguments[0]
        else
          $cookieStore.remove key
      else
        $cookieStore.get key

    # User was redirected here after attempting to volunteer,
    # so we satisfy his intent.
    voteDeferredList: (listId) ->
      self.deferredVoteListId(null) # clear it
      self.vote(listId)
