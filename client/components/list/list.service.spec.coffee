'use strict'

describe 'Service: listService', ->

  # load the service's module
  beforeEach module 'wtjApp'

  # instantiate service
  listService = undefined
  beforeEach inject (_listService_) ->
    listService = _listService_

  it 'should do something', ->
    expect(!!listService).toBe true
