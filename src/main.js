const core = require('@actions/core')
const github = require('@actions/github')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const url = core.getInput('url', { required: true })
    core.info('URL: ${url}')

    const expectedHttpStatus = core.getInput('expected-http-status', {
      required: false
    })
    core.info('expected-http-status: ${expectedHttpStatus}')

    const interval = core.getInput('interval', { required: false })
    core.info('interval: ${interval}')

    const timeout = core.getInput('timeout', { required: false })
    core.info('timeout: ${timeout}')

    const abortAtTimeout = core.getInput('abort-at-timeout', {
      required: false
    })
    core.info('abort-at-timeout: ${abortAtTimeout}')

    // Get the current time and set as an output
    const time = new Date().toTimeString()
    core.setOutput('time', time)

    const timeoutReached = 'false'
    core.setOutput('timeout-reached', timeoutReached)

    const desiredStatus = 'false'
    core.setOutput('desired-status', desiredStatus)

    // Output the payload for debugging
    core.info(
      `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
    )
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
