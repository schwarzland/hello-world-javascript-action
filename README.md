# Wait for Response Action

---

## Initial Setup for development

Base: <https://github.com/actions/javascript-action>

Know-How: <https://github.com/actions/toolkit>

### 🛠️ Install the dependencies

```bash
npm install node-fetch

npm install html-to-text

npm install
```

### 🏗️ Package the JavaScript for distribution

```bash
npm run bundle
```

### ✅ Run the tests

```bash
npm test
```

### Format, test, and build the action

```bash
npm run all
```

---

[![GitHub Super-Linter](https://github.com/actions/hello-world-javascript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/hello-world-javascript-action/actions/workflows/ci.yml/badge.svg)

The action waits for a response from a URL. It can be used, for example, to wait
for a resource to start

## Usage

Here's an example of how to use this action in a workflow file:

```yaml
name: Test Wait-For-Response-Action

on:
    push:
        branches:
            - main

jobs:
    test-action:
        name: GitHub Actions Test
        runs-on: ubuntu-latest

        steps:
            - name: Test local action 'Wait for Response' with Futurama
              id: waitForResponse
              uses: schwarzland/wait-for-response-action@main
              with:
                  url: 'https://api.sampleapis.com/futurama/info'
                  method: 'GET'
                  headers: '{ "accept":"application/json" }'
                  body-reading-method: 'JSON'
                  http-status: '200'
                  timeout: '2000'
                  single-fetch-timeout: '500'
                  waiting-time: '500'

            - name: Print Output
              run: |
                  echo duration=${{ steps.waitForResponse.outputs.duration }}
                  echo actual http-status=${{ steps.waitForResponse.outputs.http-status }}
                  echo response=${{ toJSON(steps.waitForResponse.outputs.response) }}
                  echo result=${{ steps.waitForResponse.outputs.result }}
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

| Output        | Description                                               |
| ------------- | --------------------------------------------------------- |
| `duration`    | The time in milliseconds it took to complete the request. |
| `http-status` | The achieved HTTP-Status                                  |
| `response`    | The service's response                                    |
| `result`      | query result "OK", "timeout", "maxLoop"                   |
