const core = require('@actions/core')
const github = require('@actions/github')

//https://www.npmjs.com/package/html-to-text
const { convert } = require('html-to-text')

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

    inputParameters.bodyReadingMethod = core
        .getInput('body-reading-method', {
            required: false
        })
        .toUpperCase()
    if (inputParameters.bodyReadingMethod !== '') {
        core.info(`body-reading-method: ${inputParameters.bodyReadingMethod}`)
    }

    inputParameters.httpStatus = parseInt(
        core.getInput('http-status', {
            required: false
        })
    )
    core.info(`http-status: ${inputParameters.httpStatus}`)

    inputParameters.timeout = parseInt(
        core.getInput('timeout', { required: false })
    )
    if (inputParameters.timeout < 500) {
        core.warning('timeout < 500 ms, new timeout = 500 ms')
        inputParameters.timeout = 500
    }
    if (inputParameters.timeout > 1800000) {
        core.warning('timeout > 1800000 ms, new timeout = 1800000 ms') // 30 minutes
        inputParameters.timeout = 1800000
    }
    core.info(`timeout: ${inputParameters.timeout}`)

    inputParameters.singleFetchTimeout = parseInt(
        core.getInput('single-fetch-timeout', { required: false })
    )
    if (inputParameters.singleFetchTimeout < 200) {
        core.warning(
            'single-fetch-timeout < 200 ms, new single-fetch-timeout = 200 ms'
        )
        inputParameters.singleFetchTimeout = 200
    }
    if (inputParameters.singleFetchTimeout > 300000) {
        core.warning(
            'single-fetch-timeout > 300000 ms, new single-fetch-timeout = 300000 ms'
        ) // 5 minutes
        inputParameters.singleFetchTimeout = 300000
    }
    core.info(`single-fetch-timeout: ${inputParameters.singleFetchTimeout}`)

    inputParameters.waitingTime = parseInt(
        core.getInput('waiting-time', { required: false })
    )
    if (inputParameters.waitingTime < 200) {
        core.warning('waiting-time < 200 ms, new waiting-time = 200 ms')
        inputParameters.waitingTime = 200
    }
    if (inputParameters.waitingTime > 600000) {
        core.warning('waiting-time > 600000 ms, new waiting-time = 600000 ms') // 10 minutes
        inputParameters.waitingTime = 600000
    }
    core.info(`waiting-time: ${inputParameters.waitingTime}`)

    return inputParameters
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
        core.info(`fetch ${inputParameters.method} ${inputParameters.url}`)
        response = await fetch(inputParameters.url, getOptions(inputParameters))

        let data = null
        switch (inputParameters.bodyReadingMethod) {
            case 'JSON': {
                data = await response.json()
                core.setOutput('response', data)
                core.info(`response json: ${JSON.stringify(data)}`)
                break
            }
            case 'TEXT': {
                data = await response.text()
                const text = convert(data, { wordwrap: 130 }) // https://www.npmjs.com/package/html-to-text
                core.setOutput('response', text)
                core.info(`response text: ${text}`)
                break
            }
            default: {
                core.info(
                    'body-reading-method not specified, the response-body is not read'
                )
                core.setOutput('response', undefined)
            }
        }
    } catch (error) {
        if (error.name === 'TimeoutError') {
            core.error(
                `Timeout: It took more than ${inputParameters.singleFetchTimeout} milliseconds to get the result!`
            )
            return 'Error'
        } else if (error.name === 'AbortError') {
            core.error('Fetch aborted by user action!')
            return 'Error'
        } else if (error.name === 'TypeError') {
            core.error('AbortSignal.timeout() method is not supported!')
            return 'Error'
        } else {
            // A network error, or some other problem.
            core.error(`Error: ${error.name}, ${error.message}`)
            return 'Error'
        }
    }

    core.info(`fetch http-status: ${response?.status}, ${response?.statusText}`)
    return parseInt(response?.status)
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

        let maxLoop = Math.ceil(
            inputParameters.timeout / inputParameters.waitingTime
        )
        do {
            core.info(`--- maxLoop: ${maxLoop}`)
            httpStatus = await tryFetch(inputParameters)
            core.setOutput('http-status', httpStatus)

            if (httpStatus !== 'Error') {
                if (httpStatus === inputParameters.httpStatus) {
                    core.info(`desired http-status achieved: ${httpStatus}`)
                    core.setOutput('result', 'ok')
                    break
                }
            }

            const time = new Date().getTime() - timeStart
            if (time > inputParameters.timeout) {
                core.error(`timeout reached: ${time} ms`)
                core.setOutput('result', 'timeout')
                break
            }

            core.info(`waiting ${inputParameters.waitingTime} ms`)
            await delay(inputParameters.waitingTime)

            maxLoop--
        } while (maxLoop > 0)
        core.info('--- loop ended')

        if (maxLoop <= 0) {
            core.error(`maxLoop reached`)
            core.setOutput('result', 'maxLoop')
        }

        // Outputs
        const duration = new Date().getTime() - timeStart
        core.setOutput('duration', duration)
        core.info(`duration: ${duration} ms`)

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
