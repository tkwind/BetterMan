# System Architecture

## Overview
A minimal Web-based API Request Engine offering dual-mode execution (Postman vs Browser) accompanied by a logic-based Issue Detection system. Built on standard HTML/CSS/JS without frameworks for maximum transparency. Contains older CLI logic natively for dual execution.

## Components
- **Web UI**: DOM structures residing in `index.html` and visually mapped by `styles.css`.
- **Request Engine**: Driven by `script.js` utilizing native browser `fetch` APIs alongside dynamically modeled DOM headers objects.
- **Analysis Layer**: The underlying detection engine built into `script.js` (`analyzeResponse()`) intercepting fetch payloads to isolate CORS errors and Browser restrictions interactively presenting formatted structural objects back to the user via UI cards.
- **CLI Interface**: Retrieves and slices arguments dynamically from `process.argv` via `app.js`.

## File Structure
- `index.html`: Entry point for browser usage.
- `script.js`: Execution logic mapping form payloads to standard requests.
- `styles.css`: Independent styling.
- `app.js`: Node CLI script parallel equivalent.
- `WALKTHROUGH.md`: Explanation documentation.
