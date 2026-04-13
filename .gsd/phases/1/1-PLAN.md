---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Advanced Logic & Error Mapping

## Objective
Enhance the analysis engine to provide more descriptive error explanations and detect method mismatches (405s/404 hints).

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Implement Enhanced Error Mapping</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Update `analyzeResponse` to map specific status codes to descriptive problems:
      - 404: "Endpoint Not Found (Check Method/URL)"
      - 401/403: "Authentication or Permission Issue"
      - 405: "Method Not Allowed"
    - Add "Method Mismatch" detection: If response is 405 or 404, check the current method. If it's POST/PUT/DELETE, add an insight that "this endpoint might only support GET".
  </action>
  <verify>Check script.js for extended status code switch/if-else logic.</verify>
  <done>Statuses 401, 403, 404, and 405 have unique, descriptive problem headers and hints.</done>
</task>

<task type="auto">
  <name>Integrate Contextual "Why" Intelligence</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Refactor the `responseIssues` population to include a `why` field that dynamically references request state (e.g. "Because you used POST on an endpoint that returned 404").
    - Ensure these insights are correctly passed to `logIssue`.
  </action>
  <verify>Run a POST request to a typically GET-only URL and check the issue explanation.</verify>
  <done>Issue cards include a specific reason linked to the user's request configuration.</done>
</task>

## Success Criteria
- [ ] 404 errors include a secondary hint about method mismatches.
- [ ] 401/403 errors correctly identify Auth problems.
- [ ] 405 errors are explicitly flagged.
- [ ] Primary issues explain the specific request-context reason.
