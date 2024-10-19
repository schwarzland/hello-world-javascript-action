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
                  url: 'https://myBackend.com/api-docs'
                  timeout: '60000'
                  stop-on-error: true

            - name: Performing Test with Bruno
              uses: krummbar/bruno-run-action@v0.2.0 # https://github.com/krummbar/bruno-run-action
              # ...
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
