# Changelog — Fun Target Lottery Game

All notable changes to this project are documented here.

---

## v0.1.0 — New Database Schema + Clean Game Flow

**Date:** 03 August 2026
**Developer:** OpenCode

### Backend — New DB schema
- Added `migrations/20260803_full_schema.sql` — the new database (roles, users, balance_add_removes, maintenance, payouts, results, record)
- **Removed** old auth tables: `refresh_tokens`, `login_history` (models, repositories, migration `20260730_auth_schema.sql`, seeders — all deleted)
- Added Sequelize models: `role`, `balanceAddRemove`, `maintenance`, `payout`, `result`, `record`
- Updated `user.model.js` to new schema: role INT FK → roles, `sponsor_agent_id` self-FK, `balance DECIMAL(15,2)`, `margin DECIMAL(5,2)`, `device CHAR(1) default M`, `paranoid` (deleted_at)
- Updated `models/index.js` associations (Role, BalanceAddRemove, Record, self sponsorAgent)
- Constants: added `ROLE_IDS`, `WIN_STATUS`, `CLAIM_STATUS`
- `show-schema.js` now prints all 7 tables

### Backend — Auth simplified (access-token only)
- Removed refresh-token rotation + login-history logic from `auth.service.js`
- Login: bcrypt + role join (`roles.role_name`) → access token + redirect; updates `login_time/login/device/deviceUUID`
- Logout: authenticated, sets `login=0, logout_time`
- Routes now: POST `/auth/login`, POST `/auth/logout`, GET `/auth/me` (`/refresh`, `/logout-all` removed)
- Global rate limiter removed from `app.js`

### Frontend — Game UI completed
- Full pixel-perfect game layout on `HomePage` (wheel, timer, winner, score, total bet, numbers 0-9, bet panels, action buttons, last-10-wins)
- GameLoadingOverlay — premium AAA loader (~6.5s: wheel drop+bounce, spin, progress steps, %, gold flash) wired on HomePage game entry
- ExitConfirmModal — AAA casino-style exit popup (gold frame, treasure box, coin icon, particles, animations)
- RotateDeviceOverlay — portrait rotation lock for mobile/tablet (<1024px)
- Password eye toggle (show/hide) in `Password.jsx`
- Removed dashed debug borders from login inputs; `ft-login-field` mobile tweak
- Removed white-screen spinners from ProtectedRoute/PublicRoute; dark body background
- index.html viewport locked; `ft-last-wins` mobile wrap (last-10-wins fills slot in landscape)
- Desktop layout approved and frozen — only mobile landscape tweaks allowed

### Frontend — Mock auth (temporary)
- `AuthContext.jsx`: backend calls commented out (`// BACKEND DISCONNECTED`), MOCK_USER `Player` balance 100000, login always succeeds, direct homepage, logout → /login

### Verification
- Frontend `npm run build` passes; backend `node -e "require('./app.js')"` passes
- Auth role test: user→USER, agent→AGENT, superadmin→SUPER_ADMIN

---

## v0.0.1 — Phase 1: Project Setup

**Date:** 30 July 2026
**Developer:** OpenCode

### Added
- **Backend project** with Express.js, Sequelize, JWT auth skeleton
  - Clean Architecture: routes → controllers → services → repositories → models
  - Winston logger (file + console), rate limiter, centralized error handler
  - User model (`users` table) with username, password, balance, status
  - RefreshToken model (`refresh_tokens` table) with token rotation support
  - Auth service: login, refresh, logout, logout-all, token generation
  - Auth routes/controller/validators
  - JWT authentication middleware
  - Environment config via dotenv + `.env.example`
- **Frontend project** with React 19, Vite, Tailwind CSS 3
  - Path aliases for clean imports
  - Axios instance with auto-refresh interceptor and request queuing
  - AuthContext using useReducer (login, logout, auto-login, token refresh)
  - useAuth hook, ProtectedRoute, PublicRoute guards
  - AppRoutes with login and home routes
  - Login page (username, password, remember me, error handling)
  - Home page (header with user info, balance, logout)
  - LoadingSpinner common component
  - API service layer (auth.service)
- **Documentation**
  - `docs/01_PROJECT_MASTER.md` — project brain
  - `docs/02_API_DOCUMENTATION.md` — API contract
  - `docs/03_CURRENT_STATUS.md` — live handover
  - `docs/04_CHANGELOG.md` — change history
- **Game Assets** — 51 images (PNG, JPG, GIF, WEBP) copied and organized
  - Organized into subdirectories: background/, buttons/, chips/, numbers/, wheel/, panels/, logos/, icons/, gifs/

### Architecture Decisions
- Chose Sequelize ORM over raw SQL for migrations, validation, and relationship management
- Chose HTTP-only cookies for refresh tokens (prevents XSS token theft)
- Used Context API + useReducer instead of Redux (sufficient complexity for this app)
- Vite proxy for dev eliminates CORS issues during development

### Notes
- No game logic yet — Phase 1 is pure infrastructure
- Database not yet created — requires MySQL 8+ setup
- All 51 game assets preserved from original project

---

## v0.0.2 — Registration API

**Date:** 30 July 2026
**Developer:** OpenCode

### Added
- **POST /auth/register** endpoint with password confirmation
  - `registerValidator` — username format rules, password match check
  - `authService.register()` — duplicate check, bcrypt hash, auto-login on signup
  - Returns `201` with user + access token + refresh cookie
- Docs updated: API doc, status, changelog

---

## v0.0.3 — Authentication Module Refactor

**Date:** 30 July 2026
**Developer:** Codex

### Changed
- Refactored authentication to match the legacy `users` table from `funtarget.sql`
- Preserved legacy fields: `mob`, `deviceUUID`, `sponser_agent`, `login`, `device`, `login_time`, `logout_time`, `remember_token`
- Removed `/auth/register` from the current production auth route surface
- Updated login response to return top-level `accessToken`, `refreshToken`, `user`, and backend-owned `redirect`
- Added DB-role redirect mapping:
  - `SUPER_ADMIN -> /super-admin`
  - `AGENT -> /agent`
  - `USER -> /game`

### Added
- `refresh_tokens` table migration with hashed refresh-token storage and `revoked_at`
- `login_history` table migration for audit logging
- Bcrypt seed SQL for `superadmin`, `agent`, and `tanmay`
- `LoginHistory` model and repository
- Auth rate limiter on login and refresh endpoints
- Current-user lookup in auth middleware and `/auth/me`

### Verification
- Auth modules load successfully with Node
- Active source no longer references old `last_login` or `is_revoked` fields
- `npm run lint` is blocked because ESLint 9 requires an `eslint.config.js`
