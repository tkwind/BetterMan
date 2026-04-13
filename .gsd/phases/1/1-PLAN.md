---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Validation & Standardization

## Objective
Standardize the tool's core logic and inputs to ensure consistent, professional, and reliable behavior.

## Context
- .gsd/SPEC.md
- d:\Projects\Better-man\script.js

## Tasks

<task type="auto">
  <name>Implement URL Validation & Input Cleaning</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Add a `validateUrl(url)` helper function.
    - Update the `sendBtn` click handler to reject malformed URLs (e.g., just "abc", "httpp://", etc.) with a clear error card.
    - Ensure URL normalization (adding `https://`) is safe and doesn't create invalid strings.
  </action>
  <verify>Try entering 'invalid-url' and verify a validation error card appears before any network attempt.</verify>
  <done>The tool rejects malformed inputs gracefully and predictably.</done>
</task>

<task type="auto">
  <name>Standardize Inference Labels & Language</name>
  <files>d:\Projects\Better-man\script.js</files>
  <action>
    - Audit `inferCause` and `analyzeResponse`.
    - Rename "Payload Restriction Detected" to "Observed Payload Restriction" to be more cautious.
    - Rename "Method Requirement Conflict" to "Observed Method Incompatibility".
    - Update all "Why" fields to use empirical language (e.g., "The server responded with..." instead of "The server thinks...").
    - Ensure the same input combination (Status, History, Headers) always produces identical Theory Titles.
  </action>
  <verify>Trigger a 404/GET sequence and verify the title is exactly 'Observed Method Incompatibility'.</verify>
  <done>The tool uses standardized, professional terminology that avoids overclaiming.</done>
</task>

## Success Criteria
- [ ] Garbage URL inputs are caught before the fetch starts.
- [ ] Theory titles are standardized and empirical.
- [ ] No absolute claims (e.g. "This is a typo") are made without proof.
