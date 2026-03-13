# Rockland Grants

Grant discovery and pipeline tracker for FQHC (Federally Qualified Health Center) CFOs. Search Grants.gov for funding opportunities, score them with AI for organizational fit, and track applications through a kanban pipeline.

## Features

- **Discover** — Search Grants.gov for federal grant opportunities by keyword
- **AI Scoring** — Claude analyzes each grant against your organization's profile and returns a 0–100 fit score with actionable recommendations
- **Pipeline** — Track grants through stages: Researching → Qualifying → Applying → Submitted → Awarded
- **Org Profile** — Configure your FQHC's clinical focus, population served, budget, and current funders to personalize AI scoring

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Prisma ORM + Neon Postgres
- Claude API (Anthropic SDK) for AI scoring
- shadcn/ui + Tailwind CSS
- Vitest for testing

## Getting Started

```bash
npm install
cp .env.example .env.local   # Add your DATABASE_URL and ANTHROPIC_API_KEY
npx prisma generate
npx prisma db push
npm run seed                  # Load demo data
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (runs prisma generate first) |
| `npm test` | Run test suite (22 tests) |
| `npm run seed` | Seed database with demo org + grants |

## Deployment

CI/CD is configured via Vercel. Pushing to `main` will automatically deploy to https://rockland-assessment.vercel.app. A pre-push hook runs tests and build locally before allowing the push.

## Documentation

- [Requirements](docs/REQUIREMENTS.md) — Problem statement, user stories, scope, and data model
- [Decisions](docs/DECISIONS.md) — Stack choices, architecture decisions, tradeoffs, and production considerations
- [Build Log](docs/BUILD_LOG.md) — Timestamped development log, blockers, and future improvements
