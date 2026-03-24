# Brand System Service (BSS)

Static-first brand identity system for generating Brand Books, Landing Pages, and Institutional Sites as HTML/CSS/JS. Design tokens drive all visual output through Style Dictionary and CSS Custom Properties.

## Architecture

BSS follows a **Static-First Architecture** (ADR-001): all deliverables default to static HTML/CSS/JS generated at build time. Next.js/CMS are optional add-ons for clients needing dynamic features.

Three delivery formats per project:

1. **Online Deploy** - Static site on Vercel, Netlify, or any hosting (ADR-008)
2. **PDF Export** - Brand Book as downloadable PDF
3. **Local Package** - ZIP with index.html, works offline via file:// (NFR-9.1)

## Monorepo Structure

```
brand-system-service/
  packages/
    core/                # Shared utilities: config, logging, errors
    tokens/              # Design token engine (W3C DTCG + Style Dictionary)
    creative/            # Creative pipeline (Satori + Sharp rendering)
    static-generator/    # Static HTML/CSS/JS generation
```

| Package | Description | Dependencies |
|---------|-------------|--------------|
| `@bss/core` | Config, logger, error classes | dotenv |
| `@bss/tokens` | Token validation, Style Dictionary builds | @bss/core |
| `@bss/creative` | Satori + Sharp creative rendering | @bss/core, @bss/tokens |
| `@bss/static-generator` | HTML generation, token injection | @bss/core, @bss/tokens |

## Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install pnpm if not present
npm install -g pnpm

# Install dependencies
pnpm install

# Copy environment config
cp .env.example .env
# Edit .env with your values
```

### Development

```bash
# Run type checking across all packages
pnpm type-check

# Lint all files
pnpm lint

# Build all packages
pnpm build

# Build specific deliverables
pnpm build:brand-book
pnpm build:landing-page
pnpm build:site

# Format code
pnpm format
```

## Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| TypeScript | 5.x | Language (strict mode) |
| Tailwind CSS | 3.x | Utility-first CSS with token integration |
| Style Dictionary | 4.x | Design token transforms (BSS-1.2) |
| Satori + Sharp | latest | Creative rendering (BSS-1.4) |
| Handlebars/EJS | latest | HTML templates (BSS-1.3) |
| ESLint | 8.x | Code quality with jsx-a11y for WCAG AA |
| Prettier | 3.x | Code formatting |
| Husky | 9.x | Git hooks (pre-commit: lint + format) |
| pnpm | 9.x | Package manager with workspaces |

## Coding Standards

- **ES2022** target
- **2-space indent**, single quotes, semicolons
- **kebab-case** for files (`token-loader.ts`)
- **PascalCase** for classes/components (`ColorSwatch`)
- **SCREAMING_SNAKE_CASE** for constants (`MAX_REVISION_ROUNDS`)
- No `any` - use proper types or `unknown` with type guards
- All imports use path aliases (`@bss/core`, `@bss/tokens`, etc.)

## Environment Variables

See `.env.example` for the complete list. Key groups:

| Group | Variables | Required |
|-------|-----------|----------|
| R2 Storage | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, etc. | For asset storage |
| AI Providers | `CLAUDE_API_KEY`, `OPENAI_API_KEY`, etc. | For AI features |
| ClickUp | `CLICKUP_API_KEY`, `CLICKUP_WORKSPACE_ID` | For operations |
| Build | `BSS_CLIENT_ID`, `BSS_OUTPUT_DIR` | Always (has defaults) |
| Monitoring | `SENTRY_DSN` | For production |

## Deployment

BSS outputs platform-agnostic static files. Deploy to any static host:

### Vercel

```bash
# vercel.json is pre-configured
vercel deploy
```

### Netlify

```bash
# netlify.toml is pre-configured
netlify deploy --prod
```

### Custom Domain (ADR-008)

Add a CNAME record pointing your domain to the static deployment:

```
brand.client-domain.com -> client-brand.vercel.app
```

## CI/CD Pipeline

The GitHub Actions workflow at `.github/workflows/deploy-static.yml` automates the full build-deploy cycle:

| Trigger | Behavior |
|---------|----------|
| Push to `main` (BSS paths) | Build + deploy to production |
| Pull request to `main` | Build only (preview validation) |
| Manual (`workflow_dispatch`) | Build + deploy with custom `client_id` |

**Pipeline stages:**

1. **Build** -- checkout, pnpm install, type-check, lint, build, upload artifact
2. **Deploy** -- Vercel and/or Netlify (whichever has secrets configured)
3. **Validate** -- post-deploy health check (200 response, security headers, cache headers)

Both deploy jobs run in parallel. The validate job runs if either deploy succeeds.

## Setting up GitHub Secrets for CI/CD

| Secret | Platform | How to Get |
|--------|----------|------------|
| `VERCEL_TOKEN` | Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Vercel | `.vercel/project.json` after running `vercel link` |
| `VERCEL_PROJECT_ID` | Vercel | `.vercel/project.json` after running `vercel link` |
| `NETLIFY_AUTH_TOKEN` | Netlify | [app.netlify.com/user/applications#personal-access-tokens](https://app.netlify.com/user/applications#personal-access-tokens) |
| `NETLIFY_SITE_ID` | Netlify | Site settings > General > Site ID |

Add secrets in GitHub: **Settings > Secrets and variables > Actions > New repository secret**.

You only need to configure secrets for the platform you intend to use. The pipeline conditionally deploys based on which secrets are present.

## Per-Client Deployments

Each client gets an isolated build and deployment:

```bash
# Build for a specific client
pnpm build:client --client={clientId}

# Register a new client deployment
pnpm ts-node packages/core/src/scripts/add-deployment.ts \
  --clientId=acme \
  --platform=vercel \
  --siteId=xxx \
  --projectId=yyy
```

| Aspect | Details |
|--------|---------|
| Config location | `deployments/{clientId}/config.json` |
| Build output | `output/{clientId}/` |
| Isolation | Each client outputs to its own directory; no cross-contamination |
| Manual dispatch | Use `workflow_dispatch` with `client_id` input |

## Platform Limits

| Platform | Free Tier Limit | Notes |
|----------|----------------|-------|
| Vercel | 100 deployments/day | Custom domains require Pro ($20/mo) for >1 domain per project |
| Netlify | 300 build minutes/month, 100GB bandwidth | 1 custom domain per site on free tier |

**Workaround for multi-client custom domains:** Create a separate Vercel/Netlify project per client. Each project gets its own free-tier limits and domain allocation independently.

## Custom Domain Setup

1. **Add a CNAME record** in your DNS provider:

   ```
   brand.client-domain.com  CNAME  client-brand.vercel.app
   ```

   Or for Netlify:

   ```
   brand.client-domain.com  CNAME  client-brand.netlify.app
   ```

2. **Configure in platform dashboard:**

   | Platform | Where |
   |----------|-------|
   | Vercel | Project Settings > Domains > Add |
   | Netlify | Site settings > Domain management > Add custom domain |

3. **SSL:** Automatic via Let's Encrypt on both platforms. No manual certificate setup required.

## Contributing

1. Follow the coding standards above
2. Run `pnpm type-check && pnpm lint` before committing
3. Pre-commit hooks enforce linting and formatting automatically
4. Reference story IDs in commit messages: `feat: add token engine [Story 1.2]`

## License

UNLICENSED - Proprietary
