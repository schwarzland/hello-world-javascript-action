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
name: Wait for a Response Workflow

on:
    workflow_dispatch:
        inputs:
            url:
                description: The URL to be checked
                required: true
                default: 'https://api.sampleapis.com/futurama/info'
                type: string

            method:
                description:
                    Allowed methods are GET, POST, PUT, PATCH, DELETE, HEAD,
                    OPTIONS
                required: true
                default: 'GET'
                type: choice
                options:
                    - GET
                    - POST
                    - PUT
                    - PATCH
                    - DELETE
                    - HEAD
                    - OPTIONS

            headers:
                description: Request Headers in JSON-Format
                required: false
                # default: '{ "accept":"application/json" }'
                type: string

            body:
                description: Body of the Request
                required: false
                default: ''

            body-reading-method:
                description:
                    Specifies how the response body should be interpreted.
                    Possible values are JSON, TEXT. If the method is not
                    specified, the body is not read.
                required: false
                default: ''
                type: string

            http-status:
                description: The expected http status
                required: false
                default: '200'
                type: string

            timeout:
                description:
                    The timeout (at least 500 milliseconds) determines when the
                    entire query should be aborted..
                required: false
                default: '5000'
                type: string

            single-fetch-timeout:
                description:
                    The timeout (at least 200 milliseconds) determines when the
                    single fetch should be aborted.
                required: false
                default: '1000'

            waiting-time:
                description:
                    The waiting time (at least 200 milliseconds) after a fetch
                    if the desired status has not yet been reached.
                required: false
                default: '1000'

permissions:
    actions: read
    contents: read

jobs:
    wait-for-response-test:
        name: Tests the Wait-For-Response-Action manually
        runs-on: ubuntu-latest

        steps:
            # Change @main to a specific commit SHA or version tag, e.g.:
            # actions/hello-world-javascript-action@e76147da8e5c81eaf017dede5645551d4b94427b
            # actions/hello-world-javascript-action@v1.2.3
            - name: Test Wait for Response
              id: waitForResponse
              uses: schwarzland/wait-for-response-action@main
              with:
                  url: ${{ inputs.url }}
                  method: ${{ inputs.method }}
                  headers: ${{ inputs.headers }}
                  body: ${{ inputs.body }}
                  body-reading-method: ${{ inputs.body-reading-method }}
                  http-status: ${{ inputs.http-status }}
                  timeout: ${{ inputs.timeout }}
                  single-fetch-timeout: ${{ inputs.single-fetch-timeout }}
                  waiting-time: ${{ inputs.waiting-time }}

            - name: Print Output
              id: output
              run: |
                  echo duration=${{ steps.waitForResponse.outputs.duration }}
                  echo actual http-status=${{ steps.waitForResponse.outputs.http-status }}
                  echo result=${{ steps.waitForResponse.outputs.result }}

            - name: Print JSON
              if: ${{ inputs.body-reading-method == 'JSON' }}
              run: |
                  echo response json=${{ toJSON(steps.waitForResponse.outputs.response) }}

            - name: Print TEXT
              if: ${{ inputs.body-reading-method == 'TEXT' }}
              run: |
                  echo response text=${{ steps.waitForResponse.outputs.response }}
```

For example workflow runs, check out the
[Actions tab](https://github.com/actions/hello-world-javascript-action/actions)!
🚀

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

## Outputs

| Output        | Description                                               |
| ------------- | --------------------------------------------------------- |
| `duration`    | The time in milliseconds it took to complete the request. |
| `http-status` | The achieved HTTP-Status                                  |
| `response`    | The service's response                                    |
| `result`      | query result "ok", "timeout", "maxLoop"                   |
