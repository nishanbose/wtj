'use strict'

describe 'Controller: ListEditCtrl', ->

  # load the controller's module
  beforeEach module 'wtjApp'
  EditCtrl = undefined
  scope = undefined

  # Initialize the controller and a mock scope
  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    EditCtrl = $controller 'ListEditCtrl',
      $scope: scope

  it 'should ...', ->
    expect(1).toEqual 1
