'use strict'

describe 'Controller: ListsCtrl', ->

  # load the controller's module
  beforeEach module 'wtjApp'
  ListsCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ListsCtrl = $controller 'ListsCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
