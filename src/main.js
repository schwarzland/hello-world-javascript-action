const core = require('@actions/core')
const github = require('@actions/github')

class InputParameters {
    url
    method
    headers
    body
    bodyReadingMethod
    httpStatus
    timeout
    singleFetchTimeout
    waitingTime
}

function getInputParameters() {
    const inputParameters = new InputParameters()

    inputParameters.url = core.getInput('url', { required: true })
    core.info(`url: ${inputParameters.url}`)

    inputParameters.method = core.getInput('method', {
        required: false
    })
    core.info(`method: ${inputParameters.method}`)

    inputParameters.headers = core.getInput('headers', {
        required: false
    })
    if (inputParameters.headers !== '') {
        core.info(`headers: ${inputParameters.headers}`)
    }

    inputParameters.body = core.getInput('body', {
        required: false
    })
    if (inputParameters.body !== '') {
        core.info(`body: ${inputParameters.body}`)
    }

    inputParameters.bodyReadingMethod = core.getInput('body-reading-method', {
        required: false
    })
    core.info(`body-reading-method: ${inputParameters.bodyReadingMethod}`)

    inputParameters.httpStatus = parseInt(
        core.getInput('http-status', {
            required: false
        })
    )
    core.info(`http-status: ${inputParameters.httpStatus}`)

    inputParameters.timeout = parseInt(
        core.getInput('timeout', { required: false })
    )
    core.info(`timeout: ${inputParameters.timeout}`)

    inputParameters.singleFetchTimeout = parseInt(
        core.getInput('single-fetch-timeout', { required: false })
    )
    if (inputParameters.singleFetchTimeout < 100) {
        core.warning('single-fetch-timeout < 100 ms, new timeout = 200 ms')
        inputParameters.singleFetchTimeout = 200
    }
    core.info(`single-fetch-timeout: ${inputParameters.singleFetchTimeout}`)

    inputParameters.waitingTime = parseInt(
        core.getInput('waiting-time', { required: false })
    )
    if (inputParameters.waitingTime < 100) {
        core.warning('waiting-time < 100 ms, new timeout = 200 ms')
        inputParameters.waitingTime = 200
    }
    core.info(`waiting-time: ${inputParameters.waitingTime}`)

    return inputParameters
}

function checkStatus(response) {
    if (response?.status) {
        core.info(`Status: ${response.status}, ${response.statusText}`)
        return parseInt(response.status)
    }
    return null
}

function getOptions(inputParameters) {
    const options = {
        method: inputParameters.method,
        signal: AbortSignal.timeout(inputParameters.singleFetchTimeout)
    }

    if (inputParameters.headers !== '') {
        options.headers = new Headers(JSON.parse(inputParameters.headers))
    }

    if (inputParameters.body !== '') {
        options.body = inputParameters.body
    }

    return options
}

async function tryFetch(inputParameters) {
    let response = null

    try {
        response = await fetch(inputParameters.url, getOptions(inputParameters))

        let data = null
        switch (inputParameters.bodyReadingMethod) {
            case 'JSON':
                data = await response.json()
                core.setOutput('response', data)
                //                core.info(`response json: ${JSON.stringify(data)}`)
                break
            case 'TEXT':
                data = await response.text()
                core.setOutput('response', data)
                //                core.info(`response text: ${data}`)
                break
            default:
                core.error('body-reading-method unknown')
        }
    } catch (error) {
        if (error.name === 'TimeoutError') {
            core.error(
                `Timeout: It took more than ${inputParameters.singleFetchTimeout} milliseconds to get the result!`
            )
        } else if (error.name === 'AbortError') {
            core.error(
                'Fetch aborted by user action (browser stop button, closing tab, etc.'
            )
        } else if (error.name === 'TypeError') {
            core.error('AbortSignal.timeout() method is not supported')
        } else {
            // A network error, or some other problem.
            core.error(`Error: ${error.name}, ${error.message}`)
        }
    }

    return checkStatus(response)
}

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time))
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
    try {
        const inputParameters = getInputParameters()

        // try to get a response
        const timeStart = new Date().getTime()
        let httpStatus = null

        let maxLoop = 100
        do {
            core.info(`maxLoop: ${maxLoop}`)
            httpStatus = await tryFetch(inputParameters)

            if (httpStatus === inputParameters.httpStatus) {
                core.info(`desired http-status achieved: ${httpStatus}`)
                break
            }

            const time = new Date().getTime() - timeStart
            if (time > inputParameters.timeout) {
                core.error(`timeout reached: ${time} ms`)
                break
            }

            core.info(`start waiting ${inputParameters.waitingTime} ms`)
            await delay(inputParameters.waitingTime)
            core.info('waiting completed')

            maxLoop--
        } while (maxLoop > 0)
        core.info('loop ended')

        core.setOutput('http-status', httpStatus)

        // Outputs
        const duration = new Date().getTime() - timeStart
        core.setOutput('duration', duration)

        // Output the payload for debugging
        //    core.info(
        //      `The event payload: ${JSON.stringify(github.context.payload, null, 2)}`
        //    )
    } catch (error) {
        // Fail the workflow step if an error occurs
        core.setFailed(`Action error: ${error.message}`)
    }
}

export { run }
