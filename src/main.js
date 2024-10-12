export { run }

const core = require('@actions/core')
const github = require('@actions/github')

// node-fetch from v3 is an ESM-only module - you are not able to import it with require()
// https://www.npmjs.com/package/node-fetch
import fetch from 'node-fetch';


class InputParameters {
    url;
    desiredMethod;
    requestHeaders;
    expectedHttpStatus;
    interval;
    timeout;
    abortAtTimeout;
}


function getInputParameters () {
    let inputParameters = new InputParameters();

    inputParameters.url = core.getInput('url', { required: true })
    core.info(`url: ${inputParameters.url}`)

    inputParameters.desiredMethod = core.getInput('desired-method', { required: true })
    core.info(`desired-method: ${inputParameters.desiredMethod}`)

    inputParameters.requestHeaders = core.getInput('request-headers', { required: true })
    core.info(`request-headers: ${inputParameters.requestHeaders}`)

    inputParameters.expectedHttpStatus = core.getInput('expected-http-status', { required: false })
    core.info(`expected-http-status: ${inputParameters.expectedHttpStatus}`)

    inputParameters.interval = core.getInput('interval', { required: false })
    core.info(`interval: ${inputParameters.interval}`)

    inputParameters.timeout = core.getInput('timeout', { required: false })
    core.info(`timeout: ${inputParameters.timeout}`)

    inputParameters.abortAtTimeout = core.getBooleanInput('abort-at-timeout', { required: false })
    core.info(`abort-at-timeout: ${inputParameters.abortAtTimeout}`)

    core.info ("Input-Parameters: " + JSON.stringify(inputParameters));
    return inputParameters;
}

function checkStatus (response) {
    if (response?.status) {
        core.info("Status: " + response.status + ", " + response.statusText);
        return response.status;
    }
    return null;
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    let inputParameters = getInputParameters();

    // try to get a response
    let response = null;
    let body = null;
    let status = null;

    try {
        const options = {
            method: inputParameters.desiredMethod,
            headers: new Headers(JSON.parse(inputParameters.requestHeaders))
        }
        response = await fetch(inputParameters.url, options)
        body = await response.text();
        core.info("Response: " + body)

    } catch (error) {
        core.error ("Error: " + error);
    }

    status = checkStatus (response);

    // Outputs
    const time = new Date().toTimeString()
    core.setOutput('time', time)

    const timeoutReached = 'false'
    core.setOutput('timeout-reached', timeoutReached)

    const desiredStatus = status == inputParameters.expected-http-status ? true : false;
    core.setOutput('desired-status', desiredStatus)

    core.setOutput('response', body)

    // Output the payload for debugging
    //    core.info(
    //      `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
    //    )
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.info("Mist")
    core.setFailed(error.message)
  }
}