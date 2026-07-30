# Fun Target API Documentation

> Base URL: `http://localhost:5000/api` (dev) / `{production-url}/api`

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

All auth endpoints except `/login` and `/refresh` require a `Bearer` access token in the `Authorization` header.

Access tokens expire in 15 minutes. Refresh tokens expire in 7 days, are rotated on every refresh, and are stored in the database as SHA-256 hashes only.

### POST /auth/login

Authenticate user credentials and issue tokens.

**Headers:** `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "string (required, 3-255 chars)",
  "password": "string (required, 6+ chars)",
  "device": "string (optional, max 50 chars)",
  "deviceUuid": "string (optional, max 200 chars)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Tanmay",
    "username": "tanmay",
    "role": "USER",
    "balance": 1000
  },
  "redirect": "/game"
}
```

**Redirect Mapping:** `SUPER_ADMIN -> /super-admin`, `AGENT -> /agent`, `USER -> /game`

**Cookies Set:** `refreshToken` (HTTP-only, Secure in prod, SameSite=Strict)

**Status Codes:**
| Code | Condition |
|------|-----------|
| 200 | Success |
| 400 | Validation failed |
| 401 | Invalid credentials |
| 403 | Account inactive/suspended |

---

### POST /auth/refresh

Refresh access token using the HTTP-only cookie or `refreshToken` in the request body.

**Request Body:**
```json
{
  "refreshToken": "string (optional if cookie exists)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": 1,
    "name": "Tanmay",
    "username": "tanmay",
    "role": "USER",
    "balance": 1000
  }
}
```

**Status Codes:**
| Code | Condition |
|------|-----------|
| 200 | Success |
| 401 | Refresh token missing, invalid, or expired |

---

### POST /auth/logout

Revoke current refresh token and clear cookie.

**Request Body:**
```json
{
  "refreshToken": "string (optional if cookie exists)"
}
```

**Response (200):**
```json
{ "success": true, "message": "Logout successful" }
```

---

### POST /auth/logout-all

Revoke all refresh tokens for the authenticated user.

**Headers:** `Authorization: Bearer {token}`

**Request Body:** None

**Response (200):**
```json
{ "success": true, "message": "Logged out from all devices" }
```

---

### GET /auth/me

Get current authenticated user profile.

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "User profile",
  "data": {
    "user": {
      "id": 1,
      "name": "Tanmay",
      "username": "tanmay",
      "role": "USER",
      "balance": 1000
    }
  }
}
```

---

## Authentication Database Notes

The backend remains compatible with the legacy `users` table. The following legacy columns are intentionally preserved: `mob`, `deviceUUID`, `sponser_agent`, `login`, `device`, `login_time`, `logout_time`, and `remember_token`.

Auth migration:
`backend/src/database/migrations/20260730_auth_schema.sql`

Seed users:
`backend/src/database/seeders/20260730_auth_seed_users.sql`

Seed credentials:

| Role | Username | Password |
|------|----------|----------|
| SUPER_ADMIN | superadmin | Admin@123 |
| AGENT | agent | Agent@123 |
| USER | tanmay | User@123 |

---

### GET /api/health

Health check endpoint.

**Response (200):**
```json
{
  "success": true,
  "message": "Fun Target API is running",
  "environment": "development",
  "timestamp": "2026-07-30T12:00:00.000Z"
}
```

---

## Game Endpoints (Phase 5+)

> These endpoints are planned but not yet implemented.
> API contracts will be defined here before implementation.

### GET /game/status
### GET /game/current-round
### GET /game/timer
### GET /game/current-result
### GET /game/history
### POST /game/bet
### POST /game/cancel-bet
### POST /game/take-bet
### GET /game/winner

## Wallet Endpoints (Phase 5+)

### GET /wallet/balance
### GET /wallet/history

## Admin Endpoints (Phase 8+)

### GET /admin/dashboard
### POST /admin/game/result (manual)
### GET /admin/users
### GET /admin/bets
### GET /admin/reports
### PUT /admin/settings
