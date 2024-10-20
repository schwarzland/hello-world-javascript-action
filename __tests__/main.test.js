/**
 * Unit tests for the action's main functionality, src/main.js
 */
const core = require('@actions/core')
const github = require('@actions/github')
const main = require('../src/main.js')

// Mock the GitHub Actions core library
const infoMock = jest.spyOn(core, 'info').mockImplementation()
const warningMock = jest.spyOn(core, 'warning').mockImplementation()
const getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
const setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
const setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

// Mock new Headers()
global.Headers = jest.fn(() => '')

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Other utilities
// const timeRegex = /^\d{2}:\d{2}:\d{2}/

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('call the function with meaningful parameters, body-response is JSON', async () => {
    // Mock fetch
    // https://www.leighhalliday.com/mock-fetch-jest
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ actor: 'john' }),
        status: 200,
        statusText: 'okay'
      })
    )

    // Mock the action's inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'url':
          return 'https://schwarzland.de'
          break
        case 'method':
          return 'GET'
          break
        case 'headers':
          return '{ "accept":"application/json" }'
          break
        case 'body':
          return '{ "user":"tom" }'
          break
        case 'body-reading-method':
          return 'JSON'
          break
        case 'http-status':
          return '200'
          break
        case 'timeout':
          return '1000'
          break
        case 'single-fetch-timeout':
          return '500'
          break
        case 'waiting-time':
          return '500'
          break
        case 'stop-on-error':
          return 'true'
          break
        default:
          return ''
      }
    })

    // Mock the action's payload
    github.context.payload = {}

    await main.run()

    expect(runMock).toHaveReturned()

    // check info
    expect(infoMock).toHaveBeenNthCalledWith(1, 'url: https://schwarzland.de')
    expect(infoMock).toHaveBeenNthCalledWith(2, 'method: GET')
    expect(infoMock).toHaveBeenNthCalledWith(
      3,
      'headers: { "accept":"application/json" }'
    )
    expect(infoMock).toHaveBeenNthCalledWith(4, 'body: { "user":"tom" }')
    expect(infoMock).toHaveBeenNthCalledWith(5, 'body-reading-method: JSON')
    expect(infoMock).toHaveBeenNthCalledWith(6, 'http-status: 200')
    expect(infoMock).toHaveBeenNthCalledWith(7, 'timeout: 1000 ms')
    expect(infoMock).toHaveBeenNthCalledWith(8, 'single-fetch-timeout: 500 ms')
    expect(infoMock).toHaveBeenNthCalledWith(9, 'waiting-time: 500 ms')
    expect(infoMock).toHaveBeenNthCalledWith(10, 'stop-on-error: true')

    // check output
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'response', {
      actor: 'john'
    })
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'duration',
      expect.any(Number)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'result', 'OK')
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'http-status', 200)

    // check fetch
    expect(global.fetch).toHaveBeenCalledWith(
      'https://schwarzland.de',
      expect.any(Object)
    )
  })

  it('low timeouts, body-response is text', async () => {
    // Mock fetch
    // https://www.leighhalliday.com/mock-fetch-jest
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('actor john'),
        status: 200,
        statusText: 'okay'
      })
    )

    // Mock the action's inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'url':
          return 'https://schwarzland.de'
          break
        case 'method':
          return 'GET'
          break
        case 'headers':
          return ''
          break
        case 'body':
          return ''
          break
        case 'body-reading-method':
          return 'TEXT'
          break
        case 'http-status':
          return '200'
          break
        case 'timeout':
          return '499'
          break
        case 'single-fetch-timeout':
          return '199'
          break
        case 'waiting-time':
          return '199'
          break
        case 'stop-on-error':
          return 'true'
          break
        default:
          return ''
      }
    })

    // Mock the action's payload
    github.context.payload = {}

    await main.run()

    expect(runMock).toHaveReturned()

    // check input
    expect(infoMock).toHaveBeenNthCalledWith(1, 'url: https://schwarzland.de')
    expect(infoMock).toHaveBeenNthCalledWith(2, 'method: GET')
    expect(infoMock).toHaveBeenNthCalledWith(3, 'body-reading-method: TEXT')
    expect(infoMock).toHaveBeenNthCalledWith(4, 'http-status: 200')
    expect(infoMock).toHaveBeenNthCalledWith(5, 'timeout: 500 ms')
    expect(infoMock).toHaveBeenNthCalledWith(6, 'single-fetch-timeout: 200 ms')
    expect(infoMock).toHaveBeenNthCalledWith(7, 'waiting-time: 200 ms')
    expect(infoMock).toHaveBeenNthCalledWith(8, 'stop-on-error: true')

    // check output
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'response', 'actor john')
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'duration',
      expect.any(Number)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'result', 'OK')
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'http-status', 200)

    // check warnings
    expect(warningMock).toHaveBeenNthCalledWith(
      1,
      'timeout < 500 ms, new timeout = 500 ms'
    )
    expect(warningMock).toHaveBeenNthCalledWith(
      2,
      'single-fetch-timeout < 200 ms, new single-fetch-timeout = 200 ms'
    )
    expect(warningMock).toHaveBeenNthCalledWith(
      3,
      'waiting-time < 200 ms, new waiting-time = 200 ms'
    )

    // check fetch
    expect(global.fetch).toHaveBeenCalledWith(
      'https://schwarzland.de',
      expect.any(Object)
    )
  })

  it('high timeouts, no response', async () => {
    // Mock fetch
    // https://www.leighhalliday.com/mock-fetch-jest
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(null),
        status: 200,
        statusText: 'okay'
      })
    )

    // Mock the action's inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'url':
          return 'https://schwarzland.de'
          break
        case 'method':
          return 'GET'
          break
        case 'headers':
          return ''
          break
        case 'body':
          return ''
          break
        case 'body-reading-method':
          return ''
          break
        case 'http-status':
          return '200'
          break
        case 'timeout':
          return '1800001'
          break
        case 'single-fetch-timeout':
          return '300001'
          break
        case 'waiting-time':
          return '600001'
          break
        case 'stop-on-error':
          return 'true'
          break
        default:
          return ''
      }
    })

    // Mock the action's payload
    github.context.payload = {}

    await main.run()

    expect(runMock).toHaveReturned()

    // check input
    const infos = [
      'url: https://schwarzland.de',
      'method: GET',
      'http-status: 200',
      'timeout: 1800000 ms',
      'single-fetch-timeout: 300000 ms',
      'waiting-time: 600000 ms',
      'stop-on-error: true'
    ]
    infos.forEach((item, index, arr) =>
      expect(infoMock).toHaveBeenNthCalledWith(index + 1, item)
    )

    // check output
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'response', undefined)
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'duration',
      expect.any(Number)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'result', 'OK')
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'http-status', 200)

    // check warnings
    const warnings = [
      'timeout > 1800000 ms, new timeout = 1800000 ms',
      'single-fetch-timeout > 300000 ms, new single-fetch-timeout = 300000 ms',
      'waiting-time > 600000 ms, new waiting-time = 600000 ms'
    ]
    warnings.forEach((item, index, arr) =>
      expect(warningMock).toHaveBeenNthCalledWith(index + 1, item)
    )

    // check fetch
    expect(global.fetch).toHaveBeenCalledWith(
      'https://schwarzland.de',
      expect.any(Object)
    )
  })

  it('maxLoop, no response', async () => {
    // Mock fetch
    // https://www.leighhalliday.com/mock-fetch-jest
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve('I am a teapot'),
        status: 418,
        statusText: 'okay'
      })
    )

    // Mock the action's inputs
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'url':
          return 'https://schwarzland.de'
          break
        case 'method':
          return 'GET'
          break
        case 'headers':
          return ''
          break
        case 'body':
          return ''
          break
        case 'body-reading-method':
          return ''
          break
        case 'http-status':
          return '200'
          break
        case 'timeout':
          return '500'
          break
        case 'single-fetch-timeout':
          return '200'
          break
        case 'waiting-time':
          return '500'
          break
        case 'stop-on-error':
          return 'true'
          break
        default:
          return ''
      }
    })

    // Mock the action's payload
    github.context.payload = {}

    await main.run()

    expect(runMock).toHaveReturned()

    // check input
    const infos = [
      'url: https://schwarzland.de',
      'method: GET',
      'http-status: 200',
      'timeout: 500 ms',
      'single-fetch-timeout: 200 ms',
      'waiting-time: 500 ms',
      'stop-on-error: true'
    ]
    infos.forEach((item, index, arr) =>
      expect(infoMock).toHaveBeenNthCalledWith(index + 1, item)
    )

    // check output
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'response', undefined)
    expect(setOutputMock).toHaveBeenNthCalledWith(
      2,
      'duration',
      expect.any(Number)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'result', 'maxLoop')
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'http-status', 418)

    // check failed
    expect(setFailedMock).toHaveBeenCalledWith(
      'Action failed because of stop-on-error is set and result is not OK: maxLoop'
    )

    // check fetch
    expect(global.fetch).toHaveBeenCalledWith(
      'https://schwarzland.de',
      expect.any(Object)
    )
  })
})
