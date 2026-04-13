# ROADMAP.md

> **Current Milestone**: v0.2 - Issue Detection Engine
> **Goal**: Transform the tool from a generic API client into a debugging assistant that identifies and explains why an API behaves differently in browser vs Postman-like conditions.

## Must-Haves
- [ ] CORS detection: Check `Access-Control-Allow-Origin`, display clear explanation/fix
- [ ] Origin simulation: Ensure Browser Mode sends an Origin header
- [ ] Response analysis layer: Rule-based checks on response headers and status
- [ ] Issues panel: Display detected problems clearly (problem, why, fix)
- [ ] Basic rule system: 3+ detection rules (CORS headers, Content-Type handling, Status anomalies)

## Phases

### Phase 1: Engine Structure & UI Enhancements
**Status**: ⬜ Not Started
**Objective**: Enhance the Issues panel UI to support color-coded severity, copy-paste fixes, and hook up the response analysis layer structure in `script.js`.

### Phase 2: Rules & Detection Logic
**Status**: ⬜ Not Started
**Objective**: Implement the detection rules (CORS, Content-Type, Status Codes) and the Origin simulation logic for Browser Mode, wiring them into the UI.
