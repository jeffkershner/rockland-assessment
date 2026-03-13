# Key Decisions

## Stack
- **Framework:** Next.js 16 — App Router, TypeScript strict
- **Database:** SQLite + Prisma ORM (local-first, zero-config for demo)
- **AI:** Claude API (Anthropic SDK) for grant fit scoring
- **Auth:** Skipped
- **UI:** shadcn/ui + Tailwind
- **Deployment:** Vercel
- **Reasoning:** I would not use this stack for production. We can discuss when I am there in person

## Architecture Decisions
Skipped authentication: single-org prototype, auth adds no demo value and would cost 30+ minutes. Production version would add org-level auth with something like Clerk or roll my own with auth.js

SQLite over Postgres: For a single-user prototype, SQLite eliminates external DB dependencies. Prisma abstracts the provider, so switching to Postgres is a one-line config change.

| Decision | Choice | Reasoning |
|---|---|---|
| Database | SQLite + Prisma | Zero-config local dev, no external services needed |
| AI scoring | Claude Sonnet | Best cost/quality ratio for structured JSON output |
| Grants API | Grants.gov search2 + legacy detail | Public APIs, no auth key required |
| State management | Server state via API routes | Simple, no client state library needed for prototype |

## Tradeoffs Made
| What | Production Approach | Assessment Shortcut | Reason |
|---|---|---|---|
| Database | Postgres (Neon/Supabase) | SQLite file | Zero config, fast iteration |
| Grant details | Cache + background sync | Fetch on demand from legacy API | Simpler, fewer moving parts |
| Pipeline UI | Drag-and-drop kanban | Dropdown status selector | Faster to build, same functionality |
| AI scoring | Queue + cache results | Synchronous per-request | Adequate for demo scale |

## What I'd Build With More Time
- Drag-and-drop kanban with @dnd-kit
- Grant deadline reminders and email notifications
- Bulk AI scoring with progress indicator
- Grant application checklist/task tracking per grant
- Export pipeline to CSV/PDF for board reports

## What I'd Change in Production
- Postgres on Neon/Supabase for concurrent access and durability
- Auth (Clerk or Auth.js) with org-level isolation
- Rate limiting on AI scoring endpoint
- Background job queue for AI scoring (avoid blocking requests)
- Redis cache for Grants.gov API responses
- Input sanitization on all API routes (zod validation)
