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
    if (inputParameters.headers != '') {
        core.info(`headers: ${inputParameters.headers}`)
    }

    inputParameters.body = core.getInput('body', {
        required: false
    })
    if (inputParameters.body != '') {
        core.info(`body: ${inputParameters.body}`)
    }

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

function getOptions(inputParameters) {
    inputParameters.timeout = parseInt(inputParameters.timeout)
    if (inputParameters.timeout < 200) {
        core.warning('timeout < 200 ms, new timeout = 400 ms')
        inputParameters.timeout = 400
    }

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
                core.setOutput('response', JSON.stringify(data))
                core.info(`response json: ${JSON.stringify(data)}`)
                break
            case 'TEXT':
                data = await response.text()
                core.setOutput('response', data)
                core.info(`response text: ${data}`)
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
            httpStatus = tryFetch(inputParameters)

            if (parseInt(httpStatus) === parseInt(inputParameters.httpStatus)) {
                core.info('http-status erreicht')
                break
            }

            const time = new Date().getTime() - timeStart
            if (time > 5000) {
                core.error('Zeit abgelaufen')
                break
            }

            core.info('warten 1 Sekunde...')
            await delay(1000)
            core.info('warten fertig')

            maxLoop--
        } while (maxLoop > 0)
        core.info('Schleife beendet ...')

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
