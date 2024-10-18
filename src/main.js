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
    core.info(`headers: ${inputParameters.headers}`)

    inputParameters.body = core.getInput('body', {
        required: false
    })
    core.info(`body: ${inputParameters.body}`)

    inputParameters.bodyReadingMethod = core.getInput('body-reading-method', {
        required: false
    })
    core.info(`body-reading-method: ${inputParameters.bodyReadingMethod}`)

    inputParameters.httpStatus = core.getInput('http-status', {
        required: false
    })
    core.info(`http-status: ${inputParameters.httpStatus}`)

    inputParameters.timeout = core.getInput('timeout', { required: false })
    core.info(`timeout: ${inputParameters.timeout}`)

    return inputParameters
}

function checkStatus(response) {
    if (response?.status) {
        core.info(`Status: ${response.status}, ${response.statusText}`)
        return response.status
    }
    return ''
}

async function tryFetch(inputParameters) {
    try {
        let options = {
            method: inputParameters.method,
            signal: AbortSignal.timeout(parseInt(inputParameters.timeout))
        }
        if (inputParameters.headers != '') {
            options.headers = new Headers(JSON.parse(inputParameters.headers))
        }
        if (inputParameters.body != '') {
            options.body = inputParameters.body
        }

        let response = await fetch(inputParameters.url, options)
        let data = null

        switch (inputParameters.bodyReadingMethod) {
            case 'JSON':
                data = await response.json()
                core.setOutput('response', JSON.stringify(data))
                core.info(`response json: ${JSON.stringify(data)}`)
                return data
                break
            case 'TEXT':
                data = await response.text()
                core.setOutput('response', data)
                core.info(`response text: ${data}`)
                return data
                break
            default:
                core.error('body-reading-method unknown')
        }
    } catch (error) {
        if (error.name === 'TimeoutError') {
            core.error(
                `Timeout: It took more than ${inputParameters.timeout} milliseconds to get the result!`
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
        const timeStart = new Date().getTime()
        tryFetch(inputParameters)

        // Outputs
        const time = new Date().getTime() - timeStart
        core.setOutput('time', time)

        const httpStatus = checkStatus(response)
        core.setOutput('http-status', httpStatus)

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
