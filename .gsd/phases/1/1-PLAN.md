---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Causal Comparison & Inference

## Objective
Implement deep request comparison and root cause inference to explain WHY a specific change (e.g., removing a body) fixed a failing request.

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Deepen History & Implement Comparison Engine</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Update the `requestHistory` push logic to capture `headers` count and `hasBody` (boolean).
    - Implement a `compareRequests(reqA, reqB)` function that returns a list of differences (Method changed, Body removed, Headers added/removed).
    - Update `analyzeResponse` to iterate through history and find the *most relevant* success (closest timestamp/similarity) for a deeper comparison.
  </action>
  <verify>Check script.js for compareRequests function and expanded history object.</verify>
  <done>The tool can now programmatically identify exact differences between two requests to the same URL.</done>
</task>

<task type="auto">
  <name>Implement Causal Inference Engine</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Create an `inferCause(delta)` map that translates deltas into human reasons:
      - (Body: Present -> None) + (Success: 4xx -> 2xx) => "Endpoint likely expects requests without a payload."
      - (Method: POST -> GET) + (Success: 4xx -> 2xx) => "Endpoint likely supports GET only."
    - Refactor the reasoning display in `logIssue` to show:
      - **Difference**: [Detail]
      - **Inference**: [Reason]
  </action>
  <verify>Perform a 404 POST with a body, then a 200 GET without a body, and check card for integrated inference text.</verify>
  <done>Suggestions now present a logical chain: Difference detected -> Inferred root cause.</done>
</task>

## Success Criteria
- [ ] Reasoning text includes specific field deltas (e.g. Body: Present -> None).
- [ ] Root cause inference is displayed alongside evidence.
- [ ] Inferences correctly distinguish between method changes vs body changes.
