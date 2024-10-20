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
