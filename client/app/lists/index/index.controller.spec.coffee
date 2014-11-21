'use strict'

describe 'Controller: ListIndexCtrl', ->

  # load the controller's module
  beforeEach module 'wtjApp'
  ListIndexCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    ListIndexCtrl = $controller 'ListIndexCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
