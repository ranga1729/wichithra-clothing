# Wichithra Clothing — AGENTS.md

## Quick start

```bash
npm run dev       # local dev server on :3000
npm run build     # production build
npm run lint      # ESLint only — no typecheck or test scripts defined
```

## Stack

- **Next.js 16** (App Router), **React 19**, **Tailwind CSS v4** (CSS-based config, no `tailwind.config`), **shadcn/ui** (new-york style, lucide icons)
- **Prisma ORM** v7 (PostgreSQL via `@prisma/adapter-pg`). Client output: `generated/prisma/` (gitignored). Config: `prisma.config.ts`.
- **Supabase** — file storage only (bucket: `wichithra-images`). Auth is custom JWT-based.
- **JWT auth** — cookie name: `wichithra-token` (from `lib/i18n/en.ts`). Roles: customer / admin / super-admin (UUIDs in `types/auth-types.ts`).
- **State**: Zustand, TanStack Query, TanStack Table.
- **Forms**: react-hook-form + Zod (`schemas/`).
- **Soft-delete**: `deletedAt` columns + helpers `notDeleted`, `includingDeleted`, `onlyDeleted` in `lib/prisma.ts`.

## Prisma

```bash
npx prisma generate          # regenerates client to generated/prisma/
npx prisma migrate dev       # create + apply migration
npx prisma db push           # sync schema without migration
tsx prisma/seed.ts           # seed roles (must run manually)
```

Schema: `prisma/schema.prisma`. Enums re-exported as `@/generated/prisma/enums`.

## Auth & route protection

- **Middleware** (`proxy.ts`): guards `/admin` routes, redirects to `/auth/login?redirect=...` on failure. Excludes static files and images.
- **Server actions**: use `requireRole(["admin", "super-admin"])` from `lib/server-auth-guard.ts`.
- **Admin layout** (`(admin)/layout.tsx`): reads user from cookie via `getUserFromCookie()`.

## Key directories

| Path | Purpose |
|---|---|
| `app/(shop)/` | Public frontend |
| `app/(auth)/auth/` | Login / register pages |
| `app/(admin)/admin/` | Admin dashboard |
| `components/custom/` | App-specific components (admin, auth, general, table) |
| `components/providers/` | React Query, Supabase clients, Theme, Toast |
| `components/ui/` | shadcn/ui primitives |
| `lib/` | Prisma client, JWT helpers, auth guard, i18n, Zustand stores |
| `schemas/` | Zod validation schemas |
| `types/` | TS type definitions |
| `supabase/` | Local Supabase config (`config.toml`) |
| `proxy.ts` | Middleware for route auth |

## Env requirements

`.env` (gitignored) must include: `DATABASE_URL`, `JWT_SECRET`, `TOKEN_NAME`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Patterns

- **Server actions**: files named `actions.ts` co-located with page components. Use `'use server'` directive. Return `ApiResponse<T>` from `@/types/auth-types`.
- **Soft-delete queries**: always spread `notDeleted` in Prisma `where` clauses.
- **Admin CRUD pages**: typically composed of: `page.tsx`, `columns.tsx` (TanStack Table), `actions.ts`, optional modal components.
- **Slug generation**: managed manually (no auto-slug utility — `slug` fields required in schemas).


# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features

## DATABASE SCHEMA CHANGES

- Whenever you make changes to the database schema `schema.prisma`, do not run generate and migrate commands. Let the user review edits first. 
- Do not manually edit migration files. 

## BEST PRACTICES

- Do not install packages without asking for permission. 
- Always use Tanstack queries for server data fetchings.