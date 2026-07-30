# Fun Target Lottery Game — Project Master

## Project Overview

Production-ready real-time lottery game platform built with modern JavaScript stack. Supports thousands of concurrent users with secure authentication, real-time game engine, and admin controls.

**Domain:** Real-money lottery gaming (points-based)
**Status:** Phase 1 — Project Setup

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 3, Framer Motion, React Router DOM 6 |
| State | Context API + useReducer |
| HTTP | Axios (with interceptors + auto refresh) |
| Backend | Node.js, Express.js |
| Database | MySQL 8+ (Sequelize ORM) |
| Auth | JWT Access + Refresh Token Rotation, HTTP-only Cookies, Bcrypt |
| Real-time | Socket.IO (Phase 5+) |
| Security | Helmet, CORS, Rate Limiter, Input Validation |
| Logging | Winston |
| Assets | Original game assets (51 images) |

## Architecture

```
Frontend (React 19 + Vite)
├── Presentation Layer  (components/)
├── Context Layer       (context/ + hooks/)
├── API Layer           (services/ + axios)
└── Assets Layer        (assets/images/)

Backend (Express.js)
├── Routes
├── Controllers
├── Services
├── Repositories
├── Models (Sequelize)
└── Database (MySQL 8+)
```

### Key Decisions
- **Feature-based frontend folders** — components grouped by domain (game/, login/, common/)
- **Controller → Service → Repository** backend pattern — no business logic in controllers
- **Refresh token rotation** — each refresh invalidates the old token, issues a new one
- **Sequelize over raw SQL** — migrations, model validation, relationship management

## Folder Structure

```
T:\RS Software\Fun Target/
├── backend/
│   ├── src/
│   │   ├── config/          # env, database, logger
│   │   ├── constants/       # HTTP status codes, enums
│   │   ├── controllers/     # request handlers (thin)
│   │   ├── database/
│   │   │   ├── migrations/  # Sequelize migrations
│   │   │   └── models/      # Sequelize models
│   │   ├── events/          # Event emitters
│   │   ├── helpers/         # Pure helper functions
│   │   ├── jobs/            # Cron/scheduled tasks
│   │   ├── logs/            # Winston log output
│   │   ├── middlewares/     # auth, validate, errorHandler, rateLimiter
│   │   ├── repositories/   # Data access layer
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic layer
│   │   ├── sockets/         # Socket.IO handlers
│   │   ├── uploads/         # File uploads
│   │   ├── utils/           # ApiError, ApiResponse, catchAsync
│   │   └── validators/      # express-validator rules
│   ├── app.js               # Express app setup
│   └── server.js            # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/images/   # Game assets (51 files)
│   │   ├── components/
│   │   │   ├── common/      # Reusable UI (LoadingSpinner, etc.)
│   │   │   ├── game/        # Game-specific components
│   │   │   ├── layouts/     # MainLayout, AuthLayout
│   │   │   └── login/       # Login components
│   │   ├── config/          # App config from env
│   │   ├── constants/       # Routes, storage keys
│   │   ├── context/         # AuthContext, GameContext
│   │   ├── hooks/           # useAuth, useGame
│   │   ├── pages/           # Route-level pages
│   │   ├── routes/          # AppRoutes, ProtectedRoute, PublicRoute
│   │   ├── services/        # Axios instance, auth.service
│   │   ├── styles/          # Tailwind, global CSS
│   │   └── utils/           # cn() helper, etc.
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── docs/
    ├── 01_PROJECT_MASTER.md
    ├── 02_API_DOCUMENTATION.md
    ├── 03_CURRENT_STATUS.md
    └── 04_CHANGELOG.md
```

## Coding Standards

### General
- SOLID principles, Clean Architecture
- No business logic in controllers
- Async/await only (no raw promises)
- Centralized error handling
- Standard JSON response format: `{ success, message, data, errors }`

### Backend
- Routes → Controllers → Services → Repositories → Models
- Every service method is a single responsibility
- Repository pattern for all DB access
- Validators defined independently, applied via `validate()` middleware
- Winston for all logging

### Frontend
- Feature-based folder structure
- Components are presentational; logic lives in hooks/context
- Tailwind CSS for layout + responsiveness only (not for artwork)
- Assets rendered as `<img>` tags with normal/glow class switching
- PropTypes for component props (Phase 3+)

## Authentication Flow

```
Login
  → POST /auth/login { username, password, device?, deviceUuid? }
  → Validate credentials (bcrypt.compare)
  → Read role from users table
  → Generate access token (JWT, 15min)
  → Generate refresh token (JWT, 7d)
  → Store SHA-256 hash of refresh token in DB
  → Set HTTP-only cookie with refresh token
  → Return { user, accessToken, refreshToken, redirect }

Access Token Expired
  → Axios interceptor catches 401
  → POST /auth/refresh (cookie sent automatically)
  → Validate refresh token JWT and hashed DB record
  → Set revoked_at on old refresh token
  → Issue new access token + new refresh token
  → Update cookie
  → Retry original request

Logout
  → POST /auth/logout (cookie sent)
  → Revoke refresh token in DB
  → Clear cookie
```

## Database Rules

- `users`: legacy-compatible table with `id`, `name`, `mob`, `username` (unique), `password` (bcrypt), `deviceUUID`, `balance`, `role`, `sponser_agent`, `sponsor_agent_id`, `status`, `margin`, `login`, `device`, `login_time`, `logout_time`, `remember_token`, timestamps
- `refresh_tokens`: id, user_id (FK), token (SHA-256 hash), expires_at, revoked_at, timestamps
- `login_history`: user_id, device, device_uuid, ip_address, browser, login_time, logout_time, status, timestamps
- All tables use `underscored` naming in DB, camelCase in models
- Game tables added only after game rules finalized (Phase 4)

## State Management

- `AuthContext` — user, accessToken, isAuthenticated, isLoading
- `GameContext` (Phase 4) — balance, timer, round, selected chips, selected numbers, winner, history, gameStatus
- Each context uses `useReducer` for predictable state transitions
- Context data flows down; actions flow up via dispatch

## Security Standards

- Password hashing with bcrypt (cost factor 10+)
- JWT access tokens (15min expiry)
- Refresh token rotation (old token revoked on each refresh)
- HTTP-only, Secure, SameSite=Strict cookies
- Helmet for HTTP headers
- CORS restricted to known origins
- Rate limiting (global + auth-specific)
- Input validation on every endpoint
- Sequelize parameterized queries (SQL injection protection)
- Environment-based configuration (no secrets in code)
- Winston logging (separate error.log + combined.log)

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Project Setup (folders, config, build toolchain) | ✅ Done |
| 2 | Authentication Module (login, JWT, refresh) | 🔜 Next |
| 3 | Game UI (pixel-perfect replica with assets) | ❌ Pending |
| 4 | Frontend State (GameContext, local game logic) | ❌ Pending |
| 5 | Backend Game APIs (rounds, bets, results) | ❌ Pending |
| 6 | Wheel Logic (animation + backend result calc) | ❌ Pending |
| 7 | Real-time Communication (Socket.IO) | ❌ Pending |
| 8 | Admin Panel (dashboard, control, reports) | ❌ Pending |
| 9 | Production Security Hardening | ❌ Pending |
| 10 | Deployment & Monitoring | ❌ Pending |

## Ground Rules for AI Agents

1. **Read this file first** before generating any code.
2. **Read 03_CURRENT_STATUS.md** to understand what's done and what's next.
3. **Document every API in 02_API_DOCUMENTATION.md** before implementing.
4. **Update 04_CHANGELOG.md** and **03_CURRENT_STATUS.md** after completing work.
5. Do not implement future phases ahead of schedule.
6. Frontend assets are in `frontend/src/assets/images/` — do not recreate graphics.
7. Use Tailwind CSS for layout only; game visuals use `<img>` with asset files.
8. Never commit secrets, keys, or credentials.
9. Keep code modular, testable, and production-ready at every phase.
