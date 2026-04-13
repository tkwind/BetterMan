# Code Walkthrough: Node CLI Request Engine

This document breaks down how the minimal HTTP request engine in `app.js` works under the hood.

## 1. Argument Parsing
The script extracts command-line arguments using `process.argv.slice(2)`. The first two elements in `process.argv` are always the path to Node and the path to the script, so `.slice(2)` leaves us strictly with our inputs. 

We then map these arguments into variables via array destructuring:
```javascript
const [methodStr, urlStr, headersStr, bodyStr] = args;
```
If the user provides fewer than 2 arguments (method and URL), the script immediately prints usage examples and exits with `process.exit(1)`.

## 2. Request Construction
The request is constructed using Node 18's native `fetch` API. All the parameters are consolidated into an `options` object:
```javascript
const options = {
  method,
  headers,
};
```
This keeps the `fetch(url, options)` call clean. If the chosen HTTP method isn't `GET` or `HEAD`, and a body was provided, it attaches the JSON string directly onto `options.body`.

## 3. Headers and Body Handling
Optional inputs like headers and bodies arrive as plain strings from the CLI.
- **Headers:** If a `headersStr` exists, `JSON.parse(headersStr)` evaluates it. This translates a JSON string like `'{"Content-Type": "application/json"}'` into a native JavaScript object that `fetch` understands.
- **Body:** `fetch` accepts body payloads as literal strings. However, to ensure the user hasn't made a typo before sending the request, we attempt to `JSON.parse(bodyStr)`. If it passes, we assign the raw `bodyStr` to `options.body`. If it fails, we catch it early.

## 4. Response Processing
When `await fetch(...)` resolves, we process the metadata and the data sequentially:
- **Status:** We print both the numerical `.status` and textual `.statusText`.
- **Headers:** We iterate over the `.headers.entries()` map and log each key/value pair cleanly.
- **Body:** Using `await response.text()`, we retrieve the raw string body. The code then attempts to format it via `JSON.parse()` followed by `JSON.stringify(jsonBody, null, 2)` (which adds 2-space indentation). If it's not JSON (e.g., HTML or plaintext), the `catch` block gracefully falls back to printing the unformatted string.

## 5. Error Handling
The code operates carefully, validating external inputs and anticipating network breaks.
- **Invalid URLs:** Evaluated upfront within a `try-catch` block using the `new URL(urlStr)` constructor. If the URL is incorrectly formed, it halts execution.
- **Invalid JSON Input:** Enclosed in `try-catch` blocks during both header parsing and body validation to ensure bad CLI inputs won't result in fatal unhandled Promise rejections.
- **Network Failures:** The main `fetch` call is wrapped in a `try-catch` block. If the server cannot be reached, the connection times out, or DNS resolution fails, the script cleanly prints the error output rather than crashing mysteriously.
