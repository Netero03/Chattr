# AI Rollout Checklist

## Required production configuration

Set these values in the backend deployment environment. Keep all capability flags
`false` until the provider and Redis connectivity checks pass.

```text
AI_API_KEY=<provider key>
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL_CHAT=gpt-4o-mini
AI_AGENT_ENABLED=false
AI_SMART_REPLIES_ENABLED=false
AI_AUTOCOMPLETE_ENABLED=false
AI_REDIS_URL=<existing redis connection URL>
```

`AI_REDIS_URL` is optional for a single backend instance. Configure it when more
than one backend worker or container can handle Socket.IO traffic. The limiter uses
atomic Redis increments with an expiring key and falls back to bounded local state
if Redis is temporarily unavailable.

## Verification sequence

Run these commands from the repository root before enabling a capability:

```powershell
npm run test --prefix backend
npm run lint --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
npm audit --prefix backend --audit-level=moderate
npm audit --prefix frontend --audit-level=moderate
```

Then verify:

1. Backend starts with all AI flags disabled and no provider key.
2. Backend starts with `AI_REDIS_URL` configured and Redis reachable.
3. A Redis outage produces structured fallback logs but does not stop messaging.
4. Ask AI streams deltas and ends with one assistant message.
5. Summary and task extraction persist successfully.
6. Smart replies and autocomplete respect their individual flags.
7. Rate limits remain consistent across backend instances.

## Rollout order

Enable `AI_AGENT_ENABLED`, then `AI_SMART_REPLIES_ENABLED`, then
`AI_AUTOCOMPLETE_ENABLED`. Watch `ai.request_success`, `ai.request_error`, and
rate-limit events between each change. Disable the affected flag if provider
latency, error rate, or cost exceeds the deployment budget.

## AWS deployment values needed

The application code is ready for an existing Redis deployment. The deployment
operator must provide `AI_REDIS_URL` through the platform secret store rather than
committing it to the repository. For AWS, provide `FRONTEND_URL_PROD` to the
backend runtime and `VITE_BACKEND_URL` when building the frontend. These values
must point to the public HTTPS frontend and backend endpoints respectively.

Send the backend's structured JSON logs to CloudWatch Logs through the chosen AWS
runtime, and configure CloudWatch alarms separately if desired.