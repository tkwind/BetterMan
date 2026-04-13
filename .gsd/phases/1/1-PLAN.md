---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Engine Logic Implementation

## Objective
Implement a rule-based engine inside `script.js` that checks API responses for debugging insights, primarily focusing on CORS failure conditions while in Browser Mode. It ensures useful structural feedback defaults.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Implement CORS Detection and Logic Hooks</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    Update `analyzeResponse(response, headersObj)`:
    - Check if the response lacks `access-control-allow-origin` in headersObj.
    - If `isBrowserMode` is true and CORS headers are missing, invoke `logIssue` firing a structured error object indicating the exact problem and fix: 
      `Problem: "CORS Missing"`
      `Why: "This API will fail in browser due to missing CORS headers"`
      `Fix: 'Access-Control-Allow-Origin: *'`
    - At the end of `analyzeResponse`, explicitly check if the `issuesList` is empty. If it is empty, dynamically insert a clean "No issues detected" success li into the DOM to provide positive reinforcement.
    - Add a `console.log('Raw Request Headers Sent:', options.headers);` just before `fetch` as a nice-to-have logger.
  </action>
  <verify>Test-Path d:\Projects\Better-man\script.js</verify>
  <done>The script accurately parses `access-control-allow-origin` headers dynamically assigning the explicit rich card format requested or a clean success fallback.</done>
</task>

## Success Criteria
- [ ] Users see a "CORS Missing" distinct structured card if their mock fails.
- [ ] Positive confirmation "No issues detected" behaves correctly when APIs are properly set up.
- [ ] Raw request logger executes cleanly.
