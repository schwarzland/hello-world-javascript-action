# Wait for Response Action

---

[![GitHub Super-Linter](https://github.com/schwarzland/wait-for-response-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/schwarzland/wait-for-response-action/actions/workflows/ci.yml/badge.svg)

The action waits for a response from a URL. It can be used, for example, to wait
for a resource to start.

## Usage

Here's an example of how to use this action in a workflow file:

```yaml
jobs:
    test-action:
        name: GitHub Actions Test
        runs-on: ubuntu-latest
        steps:
            - - name: Wait-For-Response with Futurama
                uses: schwarzland/wait-for-response-action@main
                id: waitForResponse
                with:
                    # The URL to be checked
                    url: 'https://api.sampleapis.com/futurama/info'

                    # Allowed methods are GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
                    method: 'GET'

                    # Request Headers in JSON-Format, e.g. '{ "accept":"application/json", "Authorization":"Bearer: aToken" }'
                    headers: '{ "accept":"application/json" }'

                    # Body of the Request, e.g. '{ "user":"mike", "password":"123abc" }'
                    body: ''

                    # Specifies how the response body should be interpreted. Possible values are JSON, TEXT. If the method is not specified, the body is not read.
                    body-reading-method: 'JSON'

                    # The expected http status
                    http-status: '200'

                    # The timeout (at least 500 milliseconds) determines when the entire query should be aborted.
                    timeout: '5000'

                    # The timeout (at least 200 milliseconds) determines when the single fetch should be aborted.
                    single-fetch-timeout: '500'

                    # The waiting time (at least 200 milliseconds) after a fetch if the desired status has not yet been reached.
                    waiting-time: '500'

                    # If true, the action is aborted on timeout-error.
                    stop-on-error: true

              - name: Print Output
                run: |
                    echo duration=${{ steps.waitForResponse.outputs.duration }}
                    echo actual http-status=${{ steps.waitForResponse.outputs.http-status }}
                    echo response=${{ toJSON(steps.waitForResponse.outputs.response) }}
                    echo result=${{ steps.waitForResponse.outputs.result }}
```

The above action produces this edition:

```text
Run schwarzland/wait-for-response-action@main
url: https://api.sampleapis.com/futurama/info
method: GET
headers: { "accept":"application/json" }
body-reading-method: JSON
http-status: 200
timeout: 5000 ms
single-fetch-timeout: 500 ms
waiting-time: 500 ms
stop-on-error: true
--- maxLoop: 10
fetch GET https://api.sampleapis.com/futurama/info
response json: [{"synopsis":"Philip J. Fry is a 25 year old delivery boy living in New York City who is cryogenically frozen on New Year's 1999 for 1000 years, where he wakes up in New New York City on December 31, 2999. There, he meets Turanga Leela, a tough but loving, beautiful one-eyed alien; and Bender, an alcohol-powered bending robot who is addicted to liquor, cigars, stealing, amongst other things. Eventually, they all meet up with Fry's Great, Great, Great, etc... Nephew, Hubert J. Farnsworth. Farnsworth is a very old man who is a genius but is very senile and forgetful. Fry, Leela, and Bender wind up working for Farnsworth's Planet Express Delivery Service. They then meet their co-workers; Amy Wong, who is a Martian intern who comes from a rich family, but is still a human who is very hip. Also, there is Hermes Conrad, who manages the delivery service and is pretty strict. Hermes seems Jamaican in voice and look. And finally, there's Dr. John Zoidberg, a lobster-like alien who is the crew's doctor. Unfortunately, he knows nothing about humans. Fry, Leela, Bender, and sometimes Amy and Dr. Zoidberg travel around the universe risking life and limb delivering packages and performing charitable tasks for tax deductions.","yearsAired":"1999–2013","creators":[{"name":"David X. Cohen","url":"http://www.imdb.com/name/nm0169326"},{"name":"Matt Groening","url":"http://www.imdb.com/name/nm0004981"}],"id":1}]
fetch http-status: 200, OK
desired http-status achieved: 200
--- loop ended
duration: 257 ms
result: OK
```

## Example

### Waiting for a backend to start after a deploy.

The backend has 60 seconds to start (timeout: 60000). Since no other parameters
were specified, the standard values are used

-   method: get
-   http status: 200
-   single-fetch timeout: 1000
-   waiting time: 1000
-   no headers
-   no body
-   no body-reading-method

The backend must first be started before the subsequent test can start. This is
followed by a smoke test with Bruno or Postman.

If the backend cannot be reached, the action aborts (stop-on-error: true)

```yaml
jobs:
    deploy:
        # ...

    smoke-test:
        name: Smoke-Test
        runs-on: ubuntu-latest
        steps:
            - name: Backend is starting
              uses: schwarzland/wait-for-response-action@main
              with:
                  url: 'https://api.sampleapis.com/futurama/info'
                  timeout: 60000
                  stop-on-error: true

            - name: Performing Test with Bruno
              uses: krummbar/bruno-run-action@v0.2.0 # https://github.com/krummbar/bruno-run-action
              # ...
```

The above action produces this edition:

```text
Run schwarzland/wait-for-response-action@main
url: https://api.sampleapis.com/futurama/info
method: GET
http-status: 200
timeout: 60000 ms
single-fetch-timeout: 1000 ms
waiting-time: 1000 ms
stop-on-error: true
--- maxLoop: 60
fetch GET https://api.sampleapis.com/futurama/info
body-reading-method not specified, the response-body is not read
fetch http-status: 200, OK
desired http-status achieved: 200
--- loop ended
duration: 176 ms
result: OK
```

## Waiting for a slow Frontend

```yaml
jobs:
    deploy:
        # ...

    smoke-test:
        name: Smoke-Test
        runs-on: ubuntu-latest
        steps:
            - name: Where is the Telekom
              uses: schwarzland/wait-for-response-action@main
              with:
                  url: 'https://www.telekom.de'
                  timeout: 10000 # try it 10 seconds
                  single-fetch-timeout: 200 # 200 milliseconds are a short time for a fetch
                  stop-on-error: true # stop the action on timeout

            - name: Performing Test with Bruno
              uses: krummbar/bruno-run-action@v0.2.0 # https://github.com/krummbar/bruno-run-action
              # ...
```

The resource could not meet the condition to respond within 200 milliseconds and
the timeout occurred after 10 seconds (`Error: timeout reached: 11016 ms`). The
action was aborted completely
(`Error: Action failed because of stop-on-error is set and result is not OK: timeout`)

```text
Run schwarzland/wait-for-response-action@main
url: https://www.telekom.de
method: GET
http-status: 200
timeout: 10000 ms
single-fetch-timeout: 200 ms
waiting-time: 1000 ms
stop-on-error: true
--- maxLoop: 10
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 9
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 8
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 7
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 6
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 5
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 4
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 3
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 2
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
waiting 1000 ms
--- maxLoop: 1
fetch GET https://www.telekom.de
Error: Timeout: It took more than 200 milliseconds to get the result!
Error: timeout reached: 11016 ms
--- loop ended
duration: 11016 ms
result: timeout
Error: Action failed because of stop-on-error is set and result is not OK: timeout
```

## Inputs

| Input                  | required | Default | Description                                                                                                                                  |
| ---------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                  | yes      |         | The URL to be checked                                                                                                                        |
| `method`               |          | `GET`   | Allowed methods are GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS                                                                             |
| `headers`              |          |         | Request Headers in JSON-Format                                                                                                               |
| `body`                 |          |         | Body of the Request                                                                                                                          |
| `body-reading-method`  |          |         | Specifies how the response body should be interpreted. Possible values are JSON, TEXT. If the method is not specified, the body is not read. |
| `http-status`          |          | `200`   | The expected http status                                                                                                                     |
| `timeout`              |          | `5000`  | The timeout (at least 500 milliseconds) determines when the entire query should be aborted.                                                  |
| `single-fetch-timeout` |          | `1000`  | The timeout (at least 200 milliseconds) determines when the single fetch should be aborted.                                                  |
| `waiting-time`         |          | `1000`  | The waiting time (at least 200 milliseconds) after a fetch if the desired status has not yet been reached.                                   |
| `stop-on-error`        |          | `FALSE` | If TRUE, the action is aborted on timeout-error                                                                                              |

## Outputs

| Output        | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| `duration`    | The time in milliseconds it took to complete the request.   |
| `http-status` | The achieved HTTP-Status                                    |
| `response`    | The service's response if body-reading-method: JSON or TEXT |
| `result`      | query result "OK", "timeout", "maxLoop"                     |

## Initial Setup for development

Base: <https://github.com/actions/javascript-action>

Know-How: <https://github.com/actions/toolkit>

### Install the dependencies

```bash
npm install node-fetch

npm install html-to-text

npm install
```

### Package the JavaScript for distribution

```bash
npm run bundle
```

### Run the tests

```bash
npm test
```

### Format, test, and build the action

```bash
npm run all
```
