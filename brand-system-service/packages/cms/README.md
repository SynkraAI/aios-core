# @brand-system/cms

Optional Payload CMS 3.x integration layer for Brand System Service.

## When to Use This Package

| Scenario | Use CMS? |
|----------|----------|
| One-time site delivery (most clients) | **No** — use static pipeline (BSS-5.1) |
| Client needs frequent content updates | **Yes** — activate CMS mode |
| Client has non-technical editors | **Yes** — CMS provides admin UI |
| Static export is the final deliverable | **Always** — CMS is authoring-only |

**Key invariant:** Even when CMS is enabled, the final deliverable is always a static HTML export. The CMS is a content authoring tool, not a runtime.

## How to Activate for a Client

```bash
BSS_CLIENT_ID=client-abc BSS_CMS_ENABLED=true pnpm --filter @brand-system/cms bootstrap
```

This is a manual, per-client operation — not automatic.

## Required Environment Variables

```bash
PAYLOAD_SECRET=          # JWT secret for Payload CMS authentication
MONGODB_URI=             # Or PostgreSQL URI (client-specific)
R2_BUCKET_NAME=          # Cloudflare R2 bucket for media uploads
R2_ENDPOINT=             # R2 endpoint URL
R2_ACCESS_KEY_ID=        # R2 access key
R2_SECRET_ACCESS_KEY=    # R2 secret key
```

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Payload CMS │────>│ CMSToStaticAdapter│────>│ StaticGenerator │
│  (authoring) │     │    (bridge)       │     │  (HTML output)  │
└─────────────┘     └──────────────────┘     └─────────────────┘
       │                                            │
       │ afterChange hook                           │
       └──> on-publish webhook ─────────────────────┘
```

## Webhook for Automatic Rebuild

Wire the `createOnPublishHook` into your Payload config:

```typescript
import { createOnPublishHook } from '@brand-system/cms';

const onPublish = createOnPublishHook({
  globalConfig: { clientId: 'abc', siteName: 'My Site', siteUrl: 'https://example.com' },
  outputDir: './output',
});

// In Pages collection:
// hooks: { afterChange: [onPublish] }
```

Then configure your deployment trigger:

- **Vercel ISR:** Call revalidation API after build
- **Netlify:** POST to Netlify build hook URL
- **GitHub Pages:** Trigger repository_dispatch workflow

## Roles & Permissions

| Role | Pages (Read) | Pages (Write) | Pages (Delete) | Media |
|------|-------------|---------------|----------------|-------|
| admin | All | All | Yes | Full |
| editor | All | Draft only | No | Upload |
| viewer | Published only | No | No | Read |

## API

```typescript
import { PayloadCMSAdapter, CMSToStaticAdapter } from '@brand-system/cms';

// Wrap Payload local API
const adapter = new PayloadCMSAdapter(payload);

// Fetch pages
const page = await adapter.getPage('about-us');
const allPages = await adapter.getAllPages();
const config = await adapter.getGlobalConfig();

// Convert to static context
const staticAdapter = new CMSToStaticAdapter(config);
const context = staticAdapter.toStaticContext(page);
const contexts = staticAdapter.toStaticContextBatch(allPages);
```

## Peer Dependencies

This package does NOT install Payload or Next.js automatically. The consumer project must install:

```bash
npm install payload@^3.0.0 next@^15.0.0
```
