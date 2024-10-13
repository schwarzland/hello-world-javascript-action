// node-fetch from v3 is an ESM-only module - you are not able to import it with require()
// https://www.npmjs.com/package/node-fetch
//import fetch from 'node-fetch'
const fetch = (url, opt) => import('node-fetch').then(({ default: fetch }) => fetch(url, opt))

const core = require('@actions/core')
const github = require('@actions/github')

class InputParameters {
  url
  desiredMethod
  requestHeaders
  expectedHttpStatus
  interval
  timeout
  abortAtTimeout
}

function getInputParameters() {
  const inputParameters = new InputParameters()

  inputParameters.url = core.getInput('url', { required: true })
  //    core.info(`url: ${inputParameters.url}`)
  inputParameters.desiredMethod = core.getInput('desired-method', {
    required: true
  })
  //    core.info(`desired-method: ${inputParameters.desiredMethod}`)
  inputParameters.requestHeaders = core.getInput('request-headers', {
    required: true
  })
  //    core.info(`request-headers: ${inputParameters.requestHeaders}`)
  inputParameters.expectedHttpStatus = core.getInput('expected-http-status', {
    required: false
  })
  //    core.info(`expected-http-status: ${inputParameters.expectedHttpStatus}`)
  inputParameters.interval = core.getInput('interval', { required: false })
  //    core.info(`interval: ${inputParameters.interval}`)
  inputParameters.timeout = core.getInput('timeout', { required: false })
  //    core.info(`timeout: ${inputParameters.timeout}`)
  inputParameters.abortAtTimeout = core.getBooleanInput('abort-at-timeout', {
    required: false
  })
  //    core.info(`abort-at-timeout: ${inputParameters.abortAtTimeout}`)

  core.info('Input-Parameters: ' + JSON.stringify(inputParameters))
  return inputParameters
}

function checkStatus(response) {
  if (response?.status) {
    core.info('Status: ' + response.status + ', ' + response.statusText)
    return response.status
  }
  return null
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const inputParameters = getInputParameters()

    // try to get a response
    let response = null
    const timeStart = new Date().getTime()

    try {
      const options = {
        method: inputParameters.desiredMethod,
        headers: new Headers(JSON.parse(inputParameters.requestHeaders)),
        signal: AbortSignal.timeout(parseInt(inputParameters.timeout))
      }

      response = await fetch(inputParameters.url, options)

      const data = await response.json()
      core.setOutput('response', JSON.stringify(data))
    } catch (error) {
      core.error('Error: ' + error)

      if (error.name === 'TimeoutError') {
        core.error('Timeout: It took more than 5 seconds to get the result!')
      } else if (error.name === 'AbortError') {
        core.error('Fetch aborted by user action (browser stop button, closing tab, etc.')
      } else if (error.name === 'TypeError') {
        core.error('AbortSignal.timeout() method is not supported')
      } else {
        // A network error, or some other problem.
        core.error(`Error: type: ${error.name}, message: ${error.message}`)
      }
    }

    // Outputs
    const time = new Date().getTime() - timeStart
    core.setOutput('time', time)

    const timeoutReached = 'false'
    core.setOutput('timeout-reached', timeoutReached)

    const desiredStatus =
      checkStatus(response) === inputParameters.expectedHttpStatus ? true : false
    core.info('desired-status: ' + desiredStatus)
    core.setOutput('desired-status', desiredStatus)

    // Output the payload for debugging
    //    core.info(
    //      `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
    //    )
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed('Action error: ' + error.message)
  }
}

export { run }
