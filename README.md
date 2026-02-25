# News API — Backend

A RESTful News API built with **Node.js**, **TypeScript**, **Express**, **Prisma**, and **PostgreSQL**. It supports user authentication, article authoring with soft-deletion, a public news feed, read tracking, daily analytics aggregation via a BullMQ job queue, and an author performance dashboard.

---

## How It Works

### Architecture Overview

```
Client
  │
  ▼
Express App (src/app.ts)
  ├── /auth         → AuthController   → AuthService   → Prisma (User)
  ├── /articles     → ArticleController → ArticleService → Prisma (Article)
  │                  PublicController  → PublicService  → Prisma (Article, ReadLog)
  └── /author       → AuthorController → AuthorService → Prisma (Article, DailyAnalytics)

Background (BullMQ + Redis)
  └── AnalyticsWorker → Aggregates ReadLog → DailyAnalytics (runs daily @ 01:00 UTC)
```

### Key Features

| Feature | How |
|---|---|
| **Authentication** | Argon2 password hashing, JWT (`sub` = userId, `role`) with 24h expiry |
| **RBAC** | `authenticate` middleware verifies JWT; `authorize('author')` guards author-only routes |
| **Article Management** | Authors can create, update, and soft-delete their own articles. Soft-delete sets `deletedAt` — data is never destroyed |
| **Public Feed** | Returns only `Published` + non-deleted articles. Supports `?category=`, `?author=`, `?q=` (keyword), `?page=`, `?size=` |
| **Read Tracking** | On `GET /articles/:id`, a `ReadLog` entry is created. A **1-hour cooldown** per IP/user prevents spam inflation |
| **Analytics Engine** | A BullMQ worker runs every day at 01:00 UTC. It groups the previous day's `ReadLog` entries by article and upserts the totals into `DailyAnalytics` |
| **Author Dashboard** | `GET /author/dashboard` returns the author's articles with `TotalViews` summed from `DailyAnalytics`, paginated |
| **Validation** | All inputs are validated with Zod schemas. Invalid inputs return `400` with specific error messages |
| **API Docs** | Swagger UI available at `/api-docs` |

### Response Shape

All endpoints return a consistent JSON envelope:

```json
{
  "Success": true,
  "Message": "...",
  "Object": {},
  "Errors": null
}
```

Paginated endpoints include:

```json
{
  "PageNumber": 1,
  "PageSize": 10,
  "TotalSize": 42
}
```

---

## Local Setup

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| PostgreSQL | ≥ 14 |
| Docker | Any recent version (used to run Redis locally) |

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd blog-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# JWT
JWT_SECRET="your_super_secret_key"
JWT_EXPIRES_IN="24h"

# Redis — local Docker instance (see step 6)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

> If you are using **Supabase**, get your connection string from:
> **Project → Settings → Database → Connection string → URI**

---

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

> For development (creates a new migration from schema changes):
> ```bash
> npx prisma migrate dev --name init
> ```

### 5. Generate the Prisma client

```bash
npx prisma generate
```

### 6. Start Redis (via Docker)

```bash
docker run -d --name redis-local -p 6379:6379 redis:alpine
```

This pulls the Redis image and starts it in the background on `127.0.0.1:6379`.

> **After a system restart**, Redis won't auto-start. Run this before `npm run dev`:
> ```bash
> docker start redis-local
> ```

### 7. Start the development server

```bash
npm run dev
```

The server starts at `http://localhost:3000`.
API documentation is available at `http://localhost:3000/api-docs`.

---

## API Endpoints

### Auth — `/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | — | Register (roles: `author` or `reader`) |
| `POST` | `/auth/login` | — | Login, returns JWT |

### Articles — `/articles`
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/articles` | Author | Create a new article |
| `GET` | `/articles/me` | Author | List own articles (all statuses) |
| `PUT` | `/articles/:id` | Author | Update own article |
| `DELETE` | `/articles/:id` | Author | Soft-delete own article |
| `GET` | `/articles` | — | Public feed (published, filterable) |
| `GET` | `/articles/:id` | — | Article detail + read tracking |

### Author — `/author`
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/author/dashboard` | Author | Paginated articles with TotalViews |

---

## Running Tests

All tests mock the database — **no real DB or Redis connection needed**.

```bash
npx jest --forceExit
```

Expected output:
```
Test Suites: 4 passed, 4 total
Tests:       34 passed, 34 total
```

The Prisma mock lives in `src/config/__mocks__/prisma.ts`. Jest picks it up automatically whenever a test file calls `jest.mock('../src/config/prisma')` — no duplication needed across test files.

---

## Project Structure

```
src/
├── app.ts                  # Express app setup (middleware, routes)
├── server.ts               # Entry point (starts server + analytics job)
├── config/
│   ├── prisma.ts           # Prisma client singleton
│   ├── swagger.ts          # Swagger configuration
│   └── __mocks__/
│       └── prisma.ts       # Auto-mock for tests (jest.mock auto-resolves this)
├── controllers/            # Route handlers (thin — delegate to services)
├── services/               # Business logic
├── middlewares/
│   ├── auth.middleware.ts  # authenticate + authorize
│   └── error.middleware.ts # Global error handler (AppError + ZodError → 400)
├── jobs/
│   └── analytics.job.ts    # BullMQ queue + worker (daily read aggregation)
├── routes/                 # Route definitions
└── interfaces/             # Shared TypeScript types

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Migration history

tests/
├── auth.test.ts
├── article.test.ts
├── public.test.ts
└── author.test.ts
```
