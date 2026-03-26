# Source Credibility (IT24101116) - Testing Evidence

## 1) Automated unit tests (dependency-free)
Run:
```bash
cd backend
npm test
```
This runs `tests/sourceCredibility.unit.test.js` and validates:
- score clamping (`0-100`)
- overall score calculation (average of authority/accuracy/recency)
- status thresholds (`verified/unverified/unreliable`)
- URL validation allowlist (`http(s)` only)

## 2) Manual UI/API tests (for the demo)
1. Add three sources using `Add New Source`:
   - `Academic` (expected: verified)
   - `Trusted Web` (expected: unverified)
   - `Other` (expected: unreliable)
2. Open each source in `Source Details`:
   - use `+/-` buttons and confirm overall score and status update
3. For the `Other`/`unreliable` source:
   - delete it and confirm it disappears from the list

## 3) Error handling checks
- Attempt to add a source with an invalid URL format (e.g. `www.example.com`) and verify you see a user-friendly error in the app.
- Verify backend returns HTTP `400` with a message for invalid payloads.

