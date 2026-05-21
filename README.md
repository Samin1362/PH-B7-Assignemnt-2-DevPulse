# DevPulse — Internal Tech Issue & Feature Tracker

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

> **Status:** Phase 1 (Foundation & Infrastructure) implemented. See [`plan.md`](./plan.md) for the full roadmap.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Node.js (LTS, 24.x+) |
| Language | TypeScript (strict) |
| Framework | Express.js 5 |
| Database | PostgreSQL (raw SQL via `pg`, no ORM, no JOINs) |
| Auth | `bcrypt` (password hashing) + `jsonwebtoken` (JWT) |
| Validation | `zod` |
| Status codes | `http-status-codes` |

---

## Project Structure

```
PH-B7-Assignment-2/
├── plan.md                    # Phased development roadmap
├── project_requirement.md     # Original assignment spec
├── README.md                  # This file
└── backend/
    ├── .env                   # Local env (gitignored)
    ├── .env.example           # Documented env template
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── app.ts             # Express app wiring
        ├── server.ts          # Boot + listen + graceful shutdown
        ├── config/index.ts    # Env loading + validation
        ├── db/index.ts        # pg Pool + query helper
        ├── middleware/
        │   ├── notFound.ts
        │   └── globalErrorHandler.ts
        ├── modules/           # (added in later phases)
        └── utils/
            ├── AppError.ts
            ├── catchAsync.ts
            └── sendResponse.ts
```

---

## Getting Started

### 1. Clone & install

```bash
git clone <your-repo-url>
cd PH-B7-Assignment-2/backend
npm install
```

### 2. Configure environment

Copy the template and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Key | Description |
|---|---|
| `CONNECTION_STRING` | PostgreSQL URL (e.g. NeonDB / Supabase) |
| `PORT` | HTTP port (default `5001`) |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | Long random string for signing tokens |
| `JWT_EXPIRES_IN` | Token TTL (e.g. `7d`) |
| `BCRYPT_SALT_ROUNDS` | Integer between 8 and 12 |

### 3. Run

```bash
npm run dev        # tsx watch mode
npm run typecheck  # type-check only
npm run build      # compile to dist/
npm start          # run compiled output
```

The server logs `DevPulse API listening on port <PORT>` once Postgres is reachable.

---

## Currently Available Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Health check — returns `{ success: true, message: "DevPulse API is running" }` |

Auth & Issues endpoints land in subsequent phases — see [`plan.md`](./plan.md).

---

## Conventions

- **No JOINs, no ORMs.** All database access is raw SQL via `pool.query()`. Relational lookups use a second `WHERE id = ANY($1::int[])` query + in-memory mapping.
- **Standard response shape**
  - Success: `{ success: true, message?, data? }`
  - Error: `{ success: false, message, errors }`
- **Errors flow through one path.** Throw `AppError(statusCode, message)` (or let Zod throw); `globalErrorHandler` formats every response.
- **Strict TypeScript.** No `any`. Request bodies, DB row types, and JWT payloads are typed.

---

## License

ISC
