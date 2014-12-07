'use strict'

describe 'Directive: fbshare', ->

  # load the directive's module and view
  beforeEach module 'wtjApp'
  beforeEach module 'app/fbshare/fbshare.html'
  element = undefined
  scope = undefined
  beforeEach inject ($rootScope) ->
    scope = $rootScope.$new()

  it 'should make hidden element visible', inject ($compile) ->
    element = angular.element '<fbshare></fbshare>'
    element = $compile(element) scope
    scope.$apply()
    expect(/fb-share-button/).toMatch element[0]
