# Current Status — Fun Target Lottery Game

> **Last Updated:** 30 July 2026
> **Current Phase:** Phase 2 — Authentication Module
> **Current Branch:** main (no git repo yet)

## Phase 1: Project Setup ✅ Complete

### Completed
- [x] Backend folder structure (Clean Architecture)
- [x] Frontend folder structure (feature-based)
- [x] Express.js server with helmet, CORS, compression, morgan, cookie-parser
- [x] Winston logger (error.log + combined.log + console in dev)
- [x] Rate limiter (global + auth-specific)
- [x] Centralized error handler (Sequelize errors, JWT errors, ApiError)
- [x] Sequelize ORM with MySQL connection config
- [x] Legacy-compatible User model (`users` table)
- [x] RefreshToken model with hashed tokens and `revoked_at`
- [x] UserRepository + RefreshTokenRepository
- [x] AuthService (login, refresh rotation, logout, logoutAll, current user)
- [x] AuthController + routes (login, refresh, logout, logout-all, me)
- [x] Auth validators (login, refresh, logout)
- [x] JWT auth middleware
- [x] React 19 + Vite + Tailwind CSS 3 setup
- [x] Path aliases (@, @components, @pages, @context, etc.)
- [x] Axios instance with auto-refresh interceptor + request queuing
- [x] AuthContext (useReducer: login, logout, auto-login, token refresh)
- [x] useAuth hook
- [x] ProtectedRoute + PublicRoute guards
- [x] AppRoutes with login/ home routes
- [x] Login page (username, password, remember me, error state)
- [x] Home page (header with user/balance, logout button, game placeholder)
- [x] LoadingSpinner common component
- [x] API service (auth.service with all endpoints)
- [x] 51 game assets copied and organized into subdirectories
- [x] Both frontend and backend verified — build passes, syntax OK

## Phase 2: Authentication Module 🟡 In Progress

### Completed
- [x] Reviewed legacy `users` table from `funtarget.sql`
- [x] Preserved legacy compatibility fields (`mob`, `deviceUUID`, `sponser_agent`, `login`, `login_time`, `logout_time`)
- [x] Added auth schema migration: `backend/src/database/migrations/20260730_auth_schema.sql`
- [x] Added seed SQL with bcrypt passwords: `backend/src/database/seeders/20260730_auth_seed_users.sql`
- [x] Added `refresh_tokens` table contract with hashed refresh tokens
- [x] Added `login_history` table contract
- [x] Implemented backend-controlled role redirects
- [x] Removed production auth dependency on `/register`
- [x] Added auth rate limiting to login and refresh

### Pending
- [ ] Run migration against the target MySQL database
- [ ] Run seed SQL against the target MySQL database
- [ ] Integration testing of login, refresh rotation, logout, and me endpoints
- [ ] Login page styling with game assets
- [ ] Error states (network error, server error, validation)
- [ ] Loading states
- [ ] Token refresh edge cases
- [ ] Password strength validation
- [ ] Account lockout after failed attempts (optional)

## Phase 3: Game UI ❌ Not Started
## Phase 4: Frontend State ❌ Not Started
## Phase 5: Backend Game APIs ❌ Not Started
## Phase 6: Wheel Logic ❌ Not Started
## Phase 7: Real-time Communication ❌ Not Started
## Phase 8: Admin Panel ❌ Not Started
## Phase 9: Production Security ❌ Not Started
## Phase 10: Deployment ❌ Not Started

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| ESLint 9 config missing (`eslint.config.js`) | Medium | Open |
| Auth migration has not been executed against MySQL in this workspace | High | Pending |

## Notes for Next Developer

1. Backend requires MySQL 8+ running with a database named `funtarget`
2. Run `backend/src/database/migrations/20260730_auth_schema.sql`
3. Run `backend/src/database/seeders/20260730_auth_seed_users.sql`
4. Environment variables are in `backend/.env` (update passwords before prod)
5. Frontend dev server proxies `/api` to `localhost:5000`
6. Assets are at `frontend/src/assets/images/` — use as-is, do not recreate
