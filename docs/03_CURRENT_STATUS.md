# Current Status — Fun Target Lottery Game

> **Last Updated:** 03 August 2026
> **Current Phase:** Phase 3-4 (Game UI + Frontend State) done; Backend Game APIs (Phase 5) next

## Completed

### Frontend — Game UI (Phase 3) ✅
- [x] HomePage with pixel-perfect game layout (desktop frozen/approved)
- [x] WheelDisplay — wheel spins on draw trigger, reports winner via onComplete
- [x] TimerDisplay + TimerDisplayGif — 60s countdown shown on the wheel
- [x] WinnerDisplay, ScoreDisplay (balance - totalBet), TotalBetDisplay
- [x] NumberDisplay (0-9 clickable, hover glow, bet amounts above numbers)
- [x] PanelDisplay — bet value selector (10/20/50/100/200/500/1000/5000)
- [x] ButtonDisplay — Cancel Bet / Take Bet / Preview / Exit (glow on hover)
- [x] LastWinningData — last 10 wins panel (mobile: wraps into rows via `ft-last-wins`)
- [x] GifDisplay + HomeBackground + HomeOverlay
- [x] ExitConfirmModal — AAA casino-style exit popup (gold frame, treasure box, particles)
- [x] GameLoadingOverlay — premium loader on game entry (~6.5s: wheel drop+spin, progress %, gold flash), wired on HomePage

### Frontend — Auth & Navigation ✅
- [x] LoginPage with game background, username/password inputs, eye toggle, enter/close buttons
- [x] ProtectedRoute / PublicRoute guards (return null while loading — no white spinner)
- [x] AppRoutes: /login (public), /game and / (protected), * → /
- [x] **Mock auth active** (`AuthContext` — search `BACKEND DISCONNECTED`): MOCK_USER Player, balance 100000; login always succeeds; logout → /login. Backend calls commented out.
- [x] RotateDeviceOverlay — portrait-only rotation lock on mobile/tablet (<1024px); landscape shows game
- [x] index.html viewport locked (`maximum-scale=1, user-scalable=no, viewport-fit=cover`)
- [x] index.css — dark body background, mobile landscape tweaks (`ft-login-field`, `ft-last-wins`)

### Backend — Database & Auth (new schema) ✅
- [x] New full schema SQL: `migrations/20260803_full_schema.sql` (roles, users, balance_add_removes, maintenance, payouts, results, record)
- [x] **Removed** old auth tables/models/repos/migrations/seeders: `refresh_tokens`, `login_history`
- [x] Models: role, user, balanceAddRemove, maintenance, payout, result, record + associations in `models/index.js`
- [x] User model matches new schema: role INT FK → roles, sponsor_agent_id self-FK, DECIMAL(15,2) balance, device CHAR(1) default M, paranoid (deleted_at)
- [x] Auth service: access-token only — login (bcrypt + role join), logout (login=0, logout_time), me
- [x] Auth routes: POST /auth/login, POST /auth/logout, GET /auth/me (refresh & logout-all removed)
- [x] Constants: ROLE_IDS, WIN_STATUS, CLAIM_STATUS added
- [x] Global rate limiter removed from app.js
- [x] show-schema.js updated to print all 7 tables

### Verified ✅
- [x] Frontend `npm run build` passes
- [x] Backend `node -e "require('./app.js')"` passes; models load (7 tables)
- [x] Auth role normalization test: user→USER, agent→AGENT, superadmin→SUPER_ADMIN

## Pending

### Frontend
- [ ] Reconnect auth (uncomment `BACKEND DISCONNECTED` blocks in AuthContext) when backend game APIs are ready
- [ ] Wire Take Bet / Preview buttons to real logic
- [ ] Wire LastWinningData + WinnerDisplay + ScoreDisplay to real API data
- [ ] Remove `/auth/refresh` auto-call from `services/api.js` interceptor (endpoint no longer exists)

### Backend — Phase 5 (Game APIs) ❌ Not Started
- [ ] POST /game/bet (validate balance → record ticket → deduct → ledger)
- [ ] GET /game/history (last 10 results)
- [ ] GET /game/current-round / status / timer
- [ ] Result settlement service (mark results, settle record tickets, credit wins, commissions)

### Phase 6-10
- [ ] Wheel/result backend logic, Socket.IO real-time, admin panel, security hardening, deployment

## Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| ESLint 9 config missing (`eslint.config.js`) in backend | Medium | Open |
| Seed user `akshay` has plain-text password `12345` — backend bcrypt login will fail until hashed | High | Open |
| Frontend `api.js` interceptor still calls `/auth/refresh` on 401 (endpoint removed) | Medium | Open (only matters after reconnect) |
| DB migration not executed against a running MySQL instance in this workspace | High | Pending |

## Notes for Next Developer

1. Desktop game UI is **frozen** — do not change layout/art/positions. Mobile landscape tweaks only.
2. Backend requires MySQL 8+ with database `funtarget`; run `20260803_full_schema.sql`.
3. Backend `.env` is in `backend/.env` (update secrets before prod).
4. To restore backend auth: uncomment `// BACKEND DISCONNECTED` blocks in `AuthContext.jsx`.
5. Assets are at `frontend/src/assets/images/` — use as-is, do not recreate.
6. This document is the live handover — update it after every work session.
