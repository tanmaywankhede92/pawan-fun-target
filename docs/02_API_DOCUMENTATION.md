# Fun Target API Documentation

> Base URL: `http://localhost:5000/api` (dev) / `{production-url}/api`
> **Note:** Frontend is currently on mock auth — these endpoints are not called until the backend is reconnected.

## Standard Response Format

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": { ... },
  "errors": [ { "field": "username", "message": "Required" } ],
  "pagination": { "page": 1, "limit": 20, "total": 100 }
}
```

## Authentication

All auth endpoints except `/login` require a `Bearer` access token in the `Authorization` header.

Access tokens are JWT, expire in 15 minutes. There is **no refresh token** (removed with the old `refresh_tokens` table). After expiry the user must log in again.

### POST /auth/login

Authenticate user credentials and issue an access token.

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "string (required, 3-255 chars)",
  "password": "string (required, 6+ chars)",
  "device": "string (optional, max 10 chars — M/W/D)",
  "deviceUuid": "string (optional, max 250 chars)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Akshay",
    "username": "akshay",
    "role": "USER",
    "balance": 100000
  },
  "redirect": "/game"
}
```

**Redirect Mapping:** `SUPER_ADMIN -> /super-admin`, `AGENT -> /agent`, `USER -> /game`

**Status Codes:**
| Code | Condition |
|------|-----------|
| 200 | Success |
| 400 | Validation failed |
| 401 | Invalid credentials |
| 403 | Account inactive/suspended |

### POST /auth/logout

Mark the authenticated user as logged out (`login=0`, `logout_time`).

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{ "success": true, "message": "Logout successful" }
```

### GET /auth/me

Get current authenticated user profile (fresh balance from DB).

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "User profile",
  "data": {
    "user": {
      "id": 1,
      "name": "Akshay",
      "username": "akshay",
      "role": "USER",
      "balance": 100000
    }
  }
}
```

---

### GET /api/health

Health check endpoint.

**Response (200):**
```json
{
  "success": true,
  "message": "Fun Target API is running",
  "environment": "development",
  "timestamp": "2026-08-03T12:00:00.000Z"
}
```

---

## Database Notes (New Schema)

Single source of truth: `backend/src/database/migrations/20260803_full_schema.sql`

Database: `funtarget`. Tables: `roles`, `users`, `balance_add_removes`, `maintenance`, `payouts`, `results`, `record`.

Removed (do not re-add): `refresh_tokens`, `login_history`.

Seed data:
- `roles`: (1, superadmin), (2, agent), (3, user)
- `users`: akshay / password `12345` (note: plain text — backend expects bcrypt hash, so login with `12345` will fail until the hash is set)

---

## Game Endpoints (Phase 5+)

> Planned, not yet implemented. Contracts defined here before implementation.

### GET /game/status
Current game state: maintenance on/off, round number, current draw time, betting open/closed.

### GET /game/current-round
Current round info (draw time, timer remaining, bonus flag).

### GET /game/timer
Countdown seconds to next draw.

### GET /game/history
Last 10 winning numbers (from `results`), newest first.

### POST /game/bet
Place a bet ticket.

**Request Body:**
```json
{
  "ticket": { "7": 10, "90": 50 },
  "qty": 60,
  "amt": 60,
  "nxt_draw": "12:00",
  "draw_time": "12:00",
  "lottery_name": "funtarget"
}
```

**Behaviour:** validate balance → create `record` (barcode, tck_result JSON) → deduct balance → write `balance_add_removes` ledger.

### POST /game/cancel-bet
Cancel current (unsubmitted) bets on the client side.

### POST /game/take-bet
Confirm/commit a placed bet ticket server-side.

### GET /game/winner
Current/last winner number.

---

## Wallet Endpoints (Phase 5+)

### GET /wallet/balance
### GET /wallet/history

---

## Admin Endpoints (Phase 8+)

### GET /admin/dashboard
### POST /admin/game/result (manual)
### GET /admin/users
### GET /admin/bets
### GET /admin/reports
### PUT /admin/settings
