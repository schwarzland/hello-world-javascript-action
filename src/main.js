const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    // Input
    const url = core.getInput('url', { required: true })
    core.info(`url: ${url}`)

    const expectedHttpStatus = core.getInput('expected-http-status', {
      required: false
    })
    core.info(`expected-http-status: ${expectedHttpStatus}`)

    const interval = core.getInput('interval', { required: false })
    core.info(`interval: ${interval}`)

    const timeout = core.getInput('timeout', { required: false })
    core.info(`timeout: ${timeout}`)

    const abortAtTimeout = core.getBooleanInput('abort-at-timeout', {
      required: false
    })
    core.info(`abort-at-timeout: ${abortAtTimeout}`)

    // try to get a response

    const fetch = require('node-fetch');

    const url = 'https://knifegrinder-backend.schwarz.goip.de/info';
    const options = {method: 'GET', headers: {Authorization: 'Bearer {{accessToken}}'}};

    const response = await fetch(url, options);
    const data = await response.json();
    core.info(data);


    // Outputs
    const time = new Date().toTimeString()
    core.setOutput('time', time)

    const timeoutReached = 'false'
    core.setOutput('timeout-reached', timeoutReached)

    const desiredStatus = 'false'
    core.setOutput('desired-status', desiredStatus)

    const response = 'some response'
    core.setOutput('response', response)

    // Output the payload for debugging
//    core.info(
//      `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
//    )
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
