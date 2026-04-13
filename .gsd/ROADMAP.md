# ROADMAP.md

> **Current Milestone**: v0.4 - Real Detection Accuracy
> **Goal**: Make the tool reliably detect and explain basic API issues across real-world scenarios.

## Must-Haves
- [ ] Correct CORS detection (missing + mismatch)
- [ ] HTTP error detection (4xx, 5xx)
- [ ] Browser Mode must inject Origin header
- [ ] Issues panel must ALWAYS reflect actual problems (no false "No issues" states)
- [ ] Support showing multiple issues simultaneously

## Phases

### Phase 1: Robust Detection Rules
**Status**: ✅ Complete
**Objective**: Implement systematic status code analysis (4xx/5xx) and CORS mismatch detection (Origin vs. Access-Control-Allow-Origin values).

### Phase 2: UI Polish & Intelligence
**Status**: ⬜ Not Started
**Objective**: Refine severity labeling, add request method mismatch hints, and ensure the "No issues detected" state is accurate.
