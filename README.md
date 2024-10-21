# Wait for Response Action

---

[![GitHub Super-Linter](https://github.com/schwarzland/wait-for-response-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/schwarzland/wait-for-response-action/actions/workflows/ci.yml/badge.svg)

The action waits for a response from a resource (URL). It can be used, for
example, to wait for a backend or frontend to start after a deployment and then
to perform a smoke test with, for example, Bruno or Postman.

Since the start of resources takes some time after a deployment and can take
several minutes depending on the environment, it makes sense to actively track
the start of the resource and then continue the pipeline with the next steps.
This action helps with this.

Wait-For-Response-Action can monitor the resource and delivers a result (result:
OK) if the resource was accessible with the desired HTTP status (e.g.
http-status: 200). This must happen within a certain period of time (e.g.
timeout: 60000). The individual query can be interrupted (e.g.
single-fetch-timeout: 2000) and then the next attempt can be made after a
waiting time (e.g. waiting-time: 1000).

If the desired HTTP status (e.g. http-status: 200) has not been reached within
the time period (e.g. timeout: 60000), the action aborts the pipeline as desired
(stop-on-error: true) or continues processing (stop-on-error: false).

## Usage

Here's an example of how to use this action in a workflow file:

```yaml
jobs:
  test-action:
    name: GitHub Actions Test
    runs-on: ubuntu-latest
    steps:
      - name: Wait-For-Response with Futurama
        uses: schwarzland/wait-for-response-action@v1.0.1
        id: waitForResponse
        with:
          # The URL to be checked
          url: 'https://api.sampleapis.com/futurama/info'

          # Allowed methods are
          # GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
          method: GET

          # Request Headers in JSON-Format, e.g.
          # '{ "accept":"application/json", "Authorization":"Bearer: aToken" }'
          headers: '{ "accept":"application/json" }'

          # Body of the Request, e.g. '{ "user":"mike", "password":"123abc" }'
          body: ''

          # Specifies how the response body should be interpreted.
          # Possible values are JSON, TEXT. If the method is not specified,
          # the body is not read.
          body-reading-method: JSON

          # The expected http status
          http-status: 200

          # The timeout (at least 500 milliseconds) determines
          # when the entire query should be aborted.
          timeout: 5000

          # The timeout (at least 200 milliseconds) determines
          # when the single fetch should be aborted.
          single-fetch-timeout: 500

          # The waiting time (at least 200 milliseconds) after
          # a fetch if the desired status has not yet been reached.
          waiting-time: 500

          # If true, the action is aborted on timeout-error.
          stop-on-error: true

      - name: Print Output
        run: |
          echo duration=${{ steps.waitForResponse.outputs.duration }}
          echo http-status=${{ steps.waitForResponse.outputs.http-status }}
          echo response=${{ toJSON(steps.waitForResponse.outputs.response) }}
          echo result=${{ steps.waitForResponse.outputs.result }}
```

## Examples

### Waiting for a backend to start after a deploy.

The backend has 60 seconds to start (timeout: 60000). Since no other parameters
were specified, the standard values are used:

- method: get
- http status: 200
- single-fetch timeout: 1000
- waiting time: 1000
- no headers
- no body
- no body-reading-method

The backend must first be started before the subsequent test can start. This is
followed by a smoke test with Bruno or Postman. If the backend cannot be
reached, the action aborts (stop-on-error: true)

```yaml
jobs:
  deploy:
    # ...

  smoke-test:
    name: Smoke-Test
    runs-on: ubuntu-latest
    steps:
      - name: Backend is starting
        uses: schwarzland/wait-for-response-action@v1.0.1
        with:
          url: 'https://api.sampleapis.com/futurama/info'
          # method: GET
          # headers: ''
          # body: ''
          # body-reading-method: ''
          # http-status: 200
          timeout: 60000
          # single-fetch timeout: 1000
          # waiting time: 1000
          stop-on-error: true

      - name: Performing Test with Bruno
        uses: krummbar/bruno-run-action@v0.2.0
        # ...
```

## Inputs

| Input                  | required | Default | Description                                                                                                                                  |
| ---------------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                  | yes      |         | The URL to be checked                                                                                                                        |
| `method`               | no       | `GET`   | Allowed methods are GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS                                                                             |
| `headers`              | no       |         | Request Headers in JSON-Format                                                                                                               |
| `body`                 | no       |         | Body of the Request                                                                                                                          |
| `body-reading-method`  | no       |         | Specifies how the response body should be interpreted. Possible values are JSON, TEXT. If the method is not specified, the body is not read. |
| `http-status`          | no       | `200`   | The expected http status                                                                                                                     |
| `timeout`              | no       | `5000`  | The timeout (at least 500 milliseconds) determines when the entire query should be aborted.                                                  |
| `single-fetch-timeout` | no       | `1000`  | The timeout (at least 200 milliseconds) determines when the single fetch should be aborted.                                                  |
| `waiting-time`         | no       | `1000`  | The waiting time (at least 200 milliseconds) after a fetch if the desired status has not yet been reached.                                   |
| `stop-on-error`        | no       | `FALSE` | If TRUE, the action is aborted on timeout-error (see timeout, not on single-fetch-timeout)                                                   |

## Outputs

| Output        | Description                                                 |
| ------------- | ----------------------------------------------------------- |
| `duration`    | The time in milliseconds it took to complete the request.   |
| `http-status` | The achieved HTTP-Status                                    |
| `response`    | The service's response if body-reading-method: JSON or TEXT |
| `result`      | query result "OK", "timeout", "maxLoop"                     |
