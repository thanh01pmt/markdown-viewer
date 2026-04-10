# Change: Add Netlify Backend Proxy

## Why
To enhance security by hiding the GitHub Classic Token from the client-side, and to provide a mechanism for optimized data fetching (fetching in parts).

## What Changes
- [NEW] `netlify.toml` for infrastructure configuration.
- [NEW] `netlify/functions/github.js` as the proxy backend.
- [MODIFY] `apps/dashboard/src/api/github.js` to redirect requests to the proxy.
- [MODIFY] `apps/dashboard/src/store/useStore.js` to handle segmented data fetching.
- [**BREAKING**] Client-side manual token entry is no longer the primary authentication method.

## Impact
- Specs: `specs/backend/spec.md`
- Code: `apps/dashboard/src/api/github.js`, `apps/dashboard/src/store/useStore.js`, `netlify/functions/github.js`
