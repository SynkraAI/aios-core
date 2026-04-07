# Port Management — MANDATORY for Dev Servers

## Rule (ALL AGENTS, ALL PROJECTS)

Before starting ANY dev server (`npm run dev`, `next dev`, `vite`, `npm start`, etc.), you MUST allocate a port using the Port Manager.

**NEVER hardcode port 3000** (or any port) when starting a dev server. The user frequently has multiple apps running simultaneously and port conflicts cause crashes.

## How to Use

### Step 1: Allocate port
```bash
eval $(node ~/aios-core/tools/port-manager.js auto <project-name>)
```

### Step 2: Start with allocated port
```bash
PORT=$PORT npm run dev
```

### One-liner
```bash
eval $(node ~/aios-core/tools/port-manager.js auto <project-name>) && PORT=$PORT npm run dev
```

### Check what's occupied
```bash
node ~/aios-core/tools/port-manager.js scan
```

## Port Ranges

| Type | Range | Examples |
|------|-------|---------|
| app | 3000-3099 | Next.js, Vite, React apps |
| api | 4000-4099 | Express, Fastify, NestJS |
| pipeline | 5000-5099 | Build tools, pipelines |
| squad | 8000-8099 | Squad dashboards |

## What This Means in Practice

- When creating a new app: use port-manager to allocate, save port in `.env` or `package.json`
- When running `npm run dev`: always prefix with `eval $(node ~/aios-core/tools/port-manager.js auto <name>) &&`
- When telling the user to open a URL: use the allocated port, NOT assumed 3000
- When writing `package.json` scripts: use `$PORT` or the allocated port, not hardcoded values

## Anti-patterns

- `npm run dev` without PORT allocation
- `# Open http://localhost:3000` without checking
- Hardcoding `PORT=3000` in .env files
- Assuming any specific port is free
