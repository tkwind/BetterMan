# System Architecture

## Overview
A minimal Node.js CLI Request Engine designed to construct, execute, and format raw HTTP requests using native Node capabilities without requiring external frameworks.

## Components
- **CLI Interface**: Retrieves and slices arguments dynamically from `process.argv`.
- **Request Engine**: Uses Node.js 18+ native `fetch` combined with custom object generation for body/headers.
- **Formatter**: Uses standard JS `JSON.parse` and `JSON.stringify` alongside console logging to render HTTP traces.

## File Structure
- `app.js`: Main execution script encapsulating all logic.
- `WALKTHROUGH.md`: Explanation documentation.
