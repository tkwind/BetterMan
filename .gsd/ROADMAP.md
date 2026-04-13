# ROADMAP.md

> **Current Milestone**: v0.9 - Causal Debugging Layer
> **Goal**: Move from correlation-based suggestions to identifying the most likely root cause by comparing differences between requests.

## Must-Haves
- [ ] Request comparison engine (Method, Body, Headers)
- [ ] Visual diff for differences
- [ ] Root cause inference (e.g. "Endpoint likely expects GET")
- [ ] Enhanced causal evidence messaging

## Phases

### Phase 1: Causal Comparison & Inference
**Status**: ✅ Complete
**Objective**: Implement the logical comparison engine and root cause mapping logic.

### Phase 2: Advanced UI Highlighting
**Status**: ⬜ Not Started
**Objective**: Implement visual diff UI and inline highlighting for changes.
