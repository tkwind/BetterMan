---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Robust Detection Rules

## Objective
Enhance the analysis engine to detect HTTP error statuses and CORS header mismatches (not just missing headers).

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Implement Status Code & CORS Mismatch Logic</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    Modify `analyzeResponse(response, headersObj)`:
    - **HTTP Status Check**: Detect 4xx and 5xx statuses. Log an issue for each (e.g., "Client Error" or "Server Error") with the numeric code and status text.
    - **CORS Mismatch Check**: If in Browser Mode, compare the sent `Origin` header with the response `Access-Control-Allow-Origin` header. If they don't match and ACAO is not `*`, log a "CORS Mismatch" error.
    - **Multiple Issues Support**: Ensure all detected issues are logged before checking for the "No issues detected" case.
  </action>
  <verify>Check for new conditional blocks in script.js for status >= 400 and CORS value comparison.</verify>
  <done>The engine logs specific cards for 404/500 errors and identifies if an API returned an ACAO header that doesn't match the simulated Origin.</done>
</task>

<task type="auto">
  <name>Refine Success State Logic</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Move the "No issues detected" check to a separate function or ensure it only fires after *all* analysis steps (including the fetch catch block if applicable, though usually analysis happens on successful responses).
    - Ensure that if a Network Error occurs (catch block), the success message is definitely suppressed.
  </action>
  <verify>Run a request that triggers an error; confirm no success card appears.</verify>
  <done>Success card only appears when absolutely no errors or warnings were logged during the entire request lifecycle.</done>
</task>

## Success Criteria
- [ ] 404/500 responses trigger dedicated issue cards.
- [ ] CORS mismatch (e.g. Origin: localhost:3000 vs ACAO: other-domain.com) is detected and reported.
- [ ] Multiple issues logged for a single request appear correctly as separate cards.
