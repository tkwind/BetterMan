# Code Explanation: Web-based API Request Tool

This document provides a technical walkthrough of how the raw HTML/JS request engine functions as per the educational requirements.

## 1. UI Inputs Mapping
The user interface is entirely hooked up via vanilla JavaScript DOM queries (`document.getElementById`). 
- **Method & URL:** The `methodSelect` dropdown and `urlInput` text fields are queried dynamically upon clicking the Send button. We also apply a simple regex normalization rule `^https?://` to prepend `https://` if the user forgets a scheme in the URL input.
- **Body:** The text block from the `bodyTextarea` is retrieved as a literal string. If the currently selected method is purely retrieval-bound (`GET` or `HEAD`), the engine safely tosses out the body string to prevent standard API rejection errors.

## 2. Header Construction
To grant users dynamic control over headers (as opposed to static configuration), we implemented a DOM append/remove mechanic. 
- A generic `header-row` template is stored and injected as raw innerHTML whenever the `+ Add Header` button is actively requested via the `headersContainer`.
- Through standard NodeList mapping (`querySelectorAll('.header-row')`), we loop through those fields constructing a generic `{}` JavaScript object mapping keys to values sequentially.

## 3. Fetch Request Building
All collected options (URL, Method, Headers, Body) are bound securely within a single `options` object block. 
```javascript
const options = {
  method,
  headers
};
if (bodyData) {
  options.body = bodyData;
}
```
We pipe this configuration explicitly into the frontend browser's native `fetch(url, options)` execution. This resolves as an asynchronous Promise.

## 4. Postman vs Browser Mode Logic
A checkbox toggle intercepts state changes and assigns the boolean flag `isBrowserMode`.
- **Postman Mode (Default):** Runs the fetch call organically as designed; whatever headers you inject are explicitly mapped and pushed to the URL endpoint without artificial intervention.
- **Browser Mode:** If enabled, the engine forcefully filters out manually added strings matching forbidden browser signatures (e.g., `origin`, `cookie`, `host`). Following standard frontend cross-origin requests, it synthetically injects an `Origin` mapping into the header utilizing the client's `window.location.origin` as proof of imitation, tracking this manipulation heavily within the DOM's `Issues Detected` error bin.

## 5. Response Rendering Mechanics
Using an `await fetch(...)` paradigm, the system pauses execution structurally to await the network trip.
- **Status Logging:** Renders string-literal concatenates of numerical variables like `.status` combined gracefully with standard spec terminology like `.statusText`.
- **Header Logging:** Utilizes the hidden `response.headers` constructor logic to `.forEach` loop over securely transmitted metadata flags appending them into a readable `JSON.stringify` DOM payload.
- **Body Styling:** The payload uses an optimistic JSON formatting block wrapped natively in a `try...catch` envelope. The content converts to JSON, pretty-printing with 2 spaces automatically. In the event the server payload is generic HTML or XML schema instead, the system gracefully traps the parse failure and injects the raw `text()` fallback onto the screen directly.

---

## Instructions to Run Locally
Because this project adheres to pure DOM configurations without bundled systems dependencies, to utilize this layout locally:

**Method 1: Direct File Access** (Simplest)
- Locate the `index.html` file within your native file explorer shell.
- Double click or right-click `Open With -> Chrome / Firefox / Safari`.
- *Note:* Certain restrictive CORS rules might act unpredictably when the context is labeled `file:///`.

**Method 2: Static Local Server** (Recommended)
- Install any generic HTTP module. (e.g. Node)
- Run standard local server deployment mapping back to `/`.
  ```bash
  npx serve .
  ```
  *(or for python: `python -m http.server 8000`)*
- Traverse browser configuration to `http://localhost:3000` to execute without URL boundary violations safely.
