# DevPulse — Internal Tech Issue & Feature Tracker

A backend service for software teams to report bugs, propose features, and track resolution workflow.

**Live URL:** _add after Render deploy_
**Repository:** _add after GitHub push_

---

## Features

- JWT-based signup & login
- Role-based access (`contributor`, `maintainer`)
- Create, list, fetch, update, and delete issues
- Filter by `type`/`status`, sort `newest`/`oldest`
- Reporter info embedded on list/get (no SQL JOINs)
- Permission rules:
  - Maintainer: edit/delete any issue
  - Contributor: edit own issue only while `open`, cannot change status

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js 24.x LTS |
| Language | TypeScript (strict) |
| Framework | Express 5 |
| Database | PostgreSQL (NeonDB) |
| Driver | `pg` (raw SQL only — no ORM, no query builder, no JOINs) |
| Auth | `bcrypt` + `jsonwebtoken` |

---

## API Endpoints

| # | Method | Path | Access | Description |
|---|---|---|---|---|
| 1 | POST | `/api/auth/signup` | Public | Register a new user |
| 2 | POST | `/api/auth/login` | Public | Login, receive JWT |
| 3 | POST | `/api/issues` | Authenticated | Create issue |
| 4 | GET | `/api/issues` | Public | List issues (`?sort`, `?type`, `?status`) |
| 5 | GET | `/api/issues/:id` | Public | Fetch one issue |
| 6 | PATCH | `/api/issues/:id` | Maintainer (any) / Contributor (own + open) | Update issue |
| 7 | DELETE | `/api/issues/:id` | Maintainer only | Delete issue |

Authenticated routes expect a raw token in the header:

```
Authorization: <JWT_TOKEN>
```

### Response Shape

```jsonc
// success
{ "success": true, "message": "…", "data": { ... } }

// error
{ "success": false, "message": "…", "errors": "…" }
```

---

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | auto-increment |
| `name` | TEXT NOT NULL | |
| `email` | TEXT UNIQUE NOT NULL | |
| `password` | TEXT NOT NULL | bcrypt hash, never returned |
| `role` | TEXT CHECK (`contributor` \| `maintainer`) | default `contributor` |
| `created_at` | TIMESTAMPTZ | default `now()` |
| `updated_at` | TIMESTAMPTZ | trigger auto-updates |

### `issues`

| Column | Type | Notes |
|---|---|---|
| `id` | SERIAL PK | |
| `title` | VARCHAR(150) NOT NULL | |
| `description` | TEXT NOT NULL | length ≥ 20 (CHECK) |
| `type` | TEXT CHECK (`bug` \| `feature_request`) | |
| `status` | TEXT CHECK (`open` \| `in_progress` \| `resolved`) | default `open` |
| `reporter_id` | INTEGER NOT NULL | no FK (validated in app) |
| `created_at` | TIMESTAMPTZ | default `now()` |
| `updated_at` | TIMESTAMPTZ | trigger auto-updates |

Indexes: `reporter_id`, `type`, `status`, `created_at`.

---

## Local Setup

```bash
git clone <repo-url>
cd PH-B7-Assignment-2/backend
npm install
cp .env.example .env       # fill in values
npm run dev
```

Server boots at `http://localhost:5001`. Health check: `GET /`.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Watch mode via `tsx` |
| `npm run typecheck` | TS check, no emit |
| `npm run build` | Compile to `dist/` |
| `npm start` | Run compiled output |

---

## Environment Variables

| Key | Example | Notes |
|---|---|---|
| `CONNECTION_STRING` | `postgresql://user:pass@host/db?sslmode=require` | NeonDB connection URL |
| `PORT` | `5001` | Render injects automatically |
| `NODE_ENV` | `production` | |
| `JWT_SECRET` | long random string | required |
| `JWT_EXPIRES_IN` | `7d` | |
| `BCRYPT_SALT_ROUNDS` | `10` | must be 8–12 |

---

## Deploy to Render

1. Push this repo to GitHub.
2. On Render, **New → Web Service** and connect the repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Node Version:** picked up from `package.json` `engines` (24.x)
4. Add the environment variables above (Render will inject `PORT` itself).
5. Deploy. Health check hits `GET /` which returns 200.

Tables must exist in the PostgreSQL instance before the first request — schema is managed in NeonDB directly, not from the app.

---

## Conventions

- **No JOINs.** Reporter data is fetched via a batched `WHERE id = ANY($1::int[])` lookup.
- **One error path.** Throw `AppError(status, message)` from anywhere; `globalErrorHandler` formats every response.
- **Strict TypeScript.** No `any`; request bodies, DB rows, and JWT payloads are typed.
