## 1. Infrastructure & Backend
- [ ] 1.1 Create `netlify.toml` with function directory settings
- [ ] 1.2 Implement `netlify/functions/github.js` with proxy logic
- [ ] 1.3 Add error handling and rate limit relaying in the proxy
- [ ] 1.4 Support `?action=aggregate` for fetching multiple files in one call

## 2. API & Store Integration
- [ ] 2.1 Update `apps/dashboard/src/api/github.js` to use proxy endpoints
- [ ] 2.2 Remove token persistence/requirement from frontend logic where possible
- [ ] 2.3 Modify `useStore.js` to utilize aggregated fetching
- [ ] 2.4 Update `vite.config.js` with proxy for local function development

## 3. Security & Validation
- [ ] 3.1 Verify `GITHUB_TOKEN` is correctly loaded from `.env` in the function
- [ ] 3.2 Ensure no tokens are leaked in the function responses
- [ ] 3.3 Test local flow with `netlify dev`
