'use strict'

describe 'Service: resetPwApi', ->

  # load the service's module
  beforeEach module 'wtjApp'

  # instantiate service
  ResetPwApi = undefined
  beforeEach inject (_ResetPwApi_) ->
    ResetPwApi = _ResetPwApi_

  it 'should do something', ->
    expect(!!ResetPwApi).toBe true
