# FinHealth Squad - Tech Stack

## Core Framework

| Component | Technology | Version |
|-----------|------------|---------|
| Agent Framework | Synkra AIOS + Squads | >= 2.1.0 |
| Runtime | Node.js | >= 18.0.0 |
| Language | TypeScript | >= 5.0 |

## Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| API Framework | Fastify | High-performance REST API |
| ORM | Prisma | Database access |
| Validation | Zod | Schema validation |
| Queue | BullMQ | Job processing |
| Cache | Redis | Caching layer |

## Database

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary DB | PostgreSQL | Main data store |
| Cache/Queue | Redis | Caching and job queues |

## AI/LLM

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary LLM | Claude API (Anthropic) | AI agent processing |
| Fallback LLM | OpenAI GPT-4o | Backup processing |

## Frontend (Optional Panel)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | Next.js 14 | React framework |
| UI Library | React | Component library |
| Styling | Tailwind CSS | Utility-first CSS |
| Components | shadcn/ui | UI components |

## Healthcare Standards

| Standard | Purpose |
|----------|---------|
| TISS/ANS | Health insurer communication |
| FHIR (HL7) | EHR integration |
| SIGTAP | SUS procedure table |
| CID-10 | Diagnosis classification |
| TUSS | Procedure terminology |
| CBHPM | Medical procedure values |

## Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Linting |
| Prettier | Code formatting |
| Vitest | Testing |
| Supertest | API testing |
| Husky | Git hooks |

## Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Containerization | Docker | Application containers |
| Orchestration | Docker Compose | Local development |
| CI/CD | GitHub Actions | Automation |

## API Documentation

| Tool | Purpose |
|------|---------|
| OpenAPI 3.0 | API specification |
| Swagger UI | Interactive docs |

## Authentication

| Component | Technology |
|-----------|------------|
| Auth Tokens | JWT |
| API Access | API Keys |

## Monitoring (Future)

| Component | Technology |
|-----------|------------|
| Metrics | Prometheus |
| Visualization | Grafana |
| Logging | ELK Stack |
