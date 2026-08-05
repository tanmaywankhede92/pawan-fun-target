# Fun Target Lottery Game — Project Master

> **Living document.** Update this file whenever architecture, flows, or structure change.

## Project Overview

Real-time lottery gaming platform (points-based) built with a modern JavaScript stack.

**Domain:** Points-based lottery gaming
**Status:** Game UI complete (frontend), Backend auth simplified to access-token, frontend temporarily on mock auth

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 3, React Router DOM 6 |
| State | Context API + useReducer (auth) + local useState (game) |
| HTTP | Axios (interceptor currently unused — backend disconnected) |
| Backend | Node.js, Express.js |
| Database | MySQL 8+ (Sequelize ORM) |
| Auth | JWT Access Token + Bcrypt (refresh tokens removed) |
| Real-time | Socket.IO (planned) |
| Security | Helmet, CORS, Input Validation |
| Logging | Winston |
| Assets | Original game assets (PNG/JPG/GIF) |

## Architecture

```
Frontend (React 19 + Vite)
├── Presentation Layer  (features/auth, features/home, components/common)
├── Context Layer       (context/AuthContext + hooks/useAuth)
├── API Layer           (services/ — currently unused, mock auth active)
└── Assets Layer        (assets/images/)

Backend (Express.js)
├── Routes → Controllers → Services → Repositories → Models (Sequelize)
└── Database (MySQL 8+ — 7 tables: roles, users, balance_add_removes,
              maintenance, payouts, results, record)
```

### Key Decisions
- **Feature-based frontend folders** — `features/auth/`, `features/home/`, `components/common/`
- **Controller → Service → Repository** backend pattern — no business logic in controllers
- **Access-token-only auth** — refresh tokens removed (new DB has no `refresh_tokens` table)
- **Frontend temporarily on mock auth** — `AuthContext` returns a mock user so the game opens directly; backend calls are commented out (search `BACKEND DISCONNECTED`)
- **Game UI is pixel-perfect** — desktop layout approved and frozen; only mobile landscape / responsive tweaks allowed

## Folder Structure (Actual)

```
T:\RS Software\Fun Target React\
├── backend/
│   ├── src/
│   │   ├── config/          # index(.env), database(Sequelize), logger(Winston)
│   │   ├── constants/       # HTTP_STATUS, USER_ROLES, ROLE_IDS, USER_STATUS, WIN_STATUS, CLAIM_STATUS
│   │   ├── controllers/     # auth.controller (login, logout, me)
│   │   ├── database/
│   │   │   ├── migrations/  # 20260803_full_schema.sql (new DB, only source of truth)
│   │   │   └── models/      # role, user, balanceAddRemove, maintenance, payout, result, record
│   │   ├── middlewares/     # auth(JWT), errorHandler, validate
│   │   ├── repositories/    # user.repository
│   │   ├── routes/          # auth.routes
│   │   ├── services/        # auth.service (login, logout, me)
│   │   ├── utils/           # ApiError, ApiResponse, catchAsync
│   │   └── validators/      # auth.validator (loginValidator)
│   ├── app.js               # Express app setup
│   ├── server.js            # Entry point
│   └── show-schema.js       # prints all Sequelize tables
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/images/   # Game assets (numbers, panels, buttons, wheel, backgrounds, gifs)
│       ├── components/
│       │   ├── common/      # RotateDeviceOverlay (portrait lock)
│       │   └── layouts/     # MainLayout
│       ├── config/          # App config from env (apiBaseUrl)
│       ├── constants/       # Routes, storage keys
│       ├── context/         # AuthContext (mock auth active)
│       ├── features/
│       │   ├── auth/        # LoginPage, UsernameInput, Password, EnterButton, CloseButton,
│       │   │                #   GameBackground, LoginOverlay, GameLoadingOverlay
│       │   └── home/        # HomePage components: WheelDisplay, TimerDisplay, TimerDisplayGif,
│       │                    #   WinnerDisplay, LastWinningData, NumberDisplay, PanelDisplay,
│       │                    #   ButtonDisplay, ScoreDisplay, TotalBetDisplay, GifDisplay,
│       │                    #   HomeBackground, HomeOverlay, ExitConfirmModal
│       ├── hooks/           # useAuth
│       ├── pages/           # HomePage
│       ├── routes/          # AppRoutes, ProtectedRoute, PublicRoute
│       ├── services/        # api.js, auth.service.js (unused while mock auth)
│       ├── styles/          # index.css (dark body, mobile landscape tweaks)
│       └── utils/           # cn()
│       ├── index.html       # viewport locked (no zoom)
│       ├── vite.config.js
│       └── package.json
└── docs/
    ├── 01_PROJECT_MASTER.md
    ├── 02_API_DOCUMENTATION.md
    ├── 03_CURRENT_STATUS.md
    └── 04_CHANGELOG.md
```

## Authentication Flow (Current)

```
Login (frontend mock OR backend access-token)
  → POST /auth/login { username, password, device?, deviceUuid? }
  → bcrypt.compare(password) against users.password
  → Check users.status (1 = active)
  → Read role via roles join (users.role → roles.id → roles.role_name)
  → Backend redirect map: SUPER_ADMIN→/super-admin, AGENT→/agent, USER→/game
  → Update users.login_time, login=1, device, deviceUUID
  → Return { user, accessToken (JWT 15m), redirect }

Protected call
  → Authorization: Bearer <accessToken>
  → authenticate middleware verifies JWT, loads user, sets req.user

Logout
  → POST /auth/logout (authenticated)
  → Update users.logout_time, login=0

Frontend (temporarily):
  → AuthContext returns MOCK_USER { id:1, username:'Player', balance:100000 }
  → Login always "succeeds", logout clears state → /login
```

## Database Rules (New Schema — single source of truth)

`backend/src/database/migrations/20260803_full_schema.sql`

| Table | Purpose | Key columns |
|-------|---------|-------------|
| `roles` | Role definitions | id, role_name (1=superadmin, 2=agent, 3=user) |
| `users` | Players/agents/admins | balance DECIMAL(15,2), role (FK), sponsor_agent_id (self FK), status, login, device CHAR(1), login_time, logout_time, deleted_at (paranoid) |
| `balance_add_removes` | Balance ledger | user_id, description, before_balance, balance_after, add_balance, remove_balance |
| `maintenance` | Global maintenance switch | message, status (0 off / 1 on) |
| `payouts` | Win multipliers | percentages, rate |
| `results` | Each draw result | result, result_time24 + result_date (unique), bonus, payout_status, edit_result |
| `record` | Betting tickets | user_id, qty, amt, nxt_draw, draw_time, barcode (unique), tck_result (JSON), win_qty, win_amount, win_status, claim_status, lottery_name, user_commi, agent_commi, deleted_at |

All tables use `underscored` naming in DB, camelCase in models. Old auth tables (`refresh_tokens`, `login_history`) were **removed** — do not re-add.

## State Management

- `AuthContext` — user, accessToken, isAuthenticated, isLoading (useReducer). Currently mock-authenticated.
- `HomePage` (game state, local useState) — phase (`timer`/`spinning`), time (60s countdown), bets map, selectedValue (panel), spinCount, lastWinner, showExitConfirm, showLoading.
- Context data flows down; actions flow up via dispatch / callbacks.

## Game Flow (Frontend)

```
Game entry (any route to /game or /)
  → GameLoadingOverlay plays (~6.5s: wheel drop, spin, progress steps, % counter, flash)
  → onDone hides overlay → game visible

Timer phase (60s)
  → TimerDisplay shows countdown, players click numbers to bet
  → PanelDisplay selects bet value (10/20/50/100/200/500/1000/5000)
  → NumberDisplay shows hovered/placed bets; bet amounts shown above numbers
  → ScoreDisplay = balance - totalBet; TotalBetDisplay = sum of bets

At time 0
  → phase = spinning, spinCount++ → WheelDisplay spins
  → onComplete(winner) → lastWinner set → 2s later back to timer (time reset 60)

Buttons
  → Cancel Bet (clears bets), Take Bet, Preview, Exit (opens ExitConfirmModal)
  → Exit confirm → logout() → navigate /login
```

## Security Standards

- Password hashing with bcrypt (cost factor 10+)
- JWT access tokens (15min expiry)
- Helmet for HTTP headers, CORS restricted to known origins
- Input validation via express-validator on every endpoint
- Sequelize parameterized queries (SQL injection protection)
- Environment-based configuration (no secrets in code)
- Winston logging (error.log + combined.log)

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Project Setup (folders, config, build toolchain) | ✅ Done |
| 2 | Authentication Module | 🔄 Reworked — access-token only + new DB schema |
| 3 | Game UI (pixel-perfect with assets) | ✅ Done (desktop approved) |
| 4 | Frontend Game State + loader | ✅ Done (mock logic) |
| 5 | Backend Game APIs (rounds, bets, results) | ❌ Pending |
| 6 | Wheel/Result Logic (backend settlement) | ❌ Pending |
| 7 | Real-time Communication (Socket.IO) | ❌ Pending |
| 8 | Admin Panel | ❌ Pending |
| 9 | Production Security Hardening | ❌ Pending |
| 10 | Deployment & Monitoring | ❌ Pending |

## Ground Rules for AI Agents

1. **Read this file first** before generating any code.
2. **Read 03_CURRENT_STATUS.md** to understand what's done and what's next.
3. **Document every API in 02_API_DOCUMENTATION.md** before implementing.
4. **Update 04_CHANGELOG.md** and **03_CURRENT_STATUS.md** after completing work.
5. Desktop game UI is **frozen** — never change layout, background, wheel, buttons, coins, art, or desktop spacing. Mobile landscape/responsive tweaks only.
6. Frontend assets are in `frontend/src/assets/images/` — do not recreate graphics.
7. Do not re-add removed tables/models (`refresh_tokens`, `login_history`).
8. Never commit secrets, keys, or credentials.
9. Keep code modular, testable, and production-ready at every phase.
