# TechCare: CLOUD-BASED INTEGRATED INFORMATION SYSTEM FOR REYNA G. DIAGNOSTIC MEDICAL CLINIC
Group Members:
- Dela Cruz, Marc Jodel
- De Guzman, Mike Cleo
- Geronga, Laurence Anthony
- Juan, Randy Jr.
- Matangob, Jiano Freo

A full-stack clinic management system: patient records, front-desk queueing, lab requests, billing, and admin/user management, split into role-based dashboards (Admin, Doctor, Front Desk, Lab Staff, Patient).

**Live site:** https://techcare-1.onrender.com/

## Tech Stack

**Backend** — `backend/`
- Express 5 + TypeScript, run with `tsx` in dev and compiled with `tsc` for production
- Neon (serverless Postgres) via `@neondatabase/serverless`
- JWT auth (`jsonwebtoken`), password hashing (`bcryptjs`)
- File uploads via `multer` → `cloudinary`
- `ws` included for websockets (currently unused/commented out in `server.ts`)

**Frontend** — `frontend/`
- React 19 + TypeScript, built with Vite
- `react-router` for client-side routing
- Tailwind CSS + `shadcn`/`@base-ui/react` components
- `axios` for API calls (`src/lib/axios.ts`)

## Repository Structure

```
TechCare-main/
├── backend/
│   └── src/
│       ├── config/         # env.ts, db.ts (Neon connection)
│       ├── controllers/    # business logic, grouped by role: admin/ fdstaff/ labstaff/ auth/
│       ├── middlewares/    # auth.middleware, admin/doctor/fdstaff/labstaff role guards, multer
│       ├── routes/         # one router per role: admin, doctor, fdstaff, labstaff, patient, auth, test
│       ├── types/
│       ├── utils/
│       └── server.ts       # app entrypoint, route mounting, serves frontend/dist in production
├── frontend/
│   └── src/
│       ├── auth/            # LoginPage, SignupPage
│       ├── users/
│       │   ├── admin/
│       │   ├── doctor/
│       │   ├── frontdesk_staff/
│       │   ├── laboratory_staff/
│       │   └── patient/
│       ├── queue/           # public queue-tracking display
│       ├── lib/              # axios instance, ProtectedRoute
│       ├── components/       # shared UI (shadcn-based)
│       └── App.tsx           # route table
├── tools/                    # scripts/utilities (ETL, etc.)
├── .github/
├── SKILL.md                  # deep internal reference for this codebase
└── package.json               # root scripts that fan out to backend/frontend
```

## Roles

Role values are lowercase, hyphenated strings, set at signup and stored on the `users` table and in the JWT: `admin`, `doctor`, `frontdesk-staff`, `laboratory-staff`, `patient`. The frontend routes to `/${role}` after login (e.g. `/frontdesk-staff`), and each role has its own dashboard tree under `frontend/src/users/`.

## Request Lifecycle

```
Browser (React)
   │  axios request, Bearer token
   ▼
Express route (backend/src/routes/*.route.ts)
   │
   ▼
authMiddleware        — verifies JWT, attaches req.user
   │
   ▼
role middleware        — admin/doctor/fdstaff/labstaff.middleware.ts, checks req.user.role
   │
   ▼
Controller (backend/src/controllers/**)
   │
   ▼
Neon Postgres
   │
   ▼
JSON response → React updates UI
```

`server.ts` mounts:
| Path | Router | Auth |
|---|---|---|
| `/api/auth` | `auth.route.ts` | none (login) |
| `/api/test` | `test.routes.ts` | mixed (legacy/dev routes) |
| `/api/admin` | `admin.route.ts` | `authMiddleware` + `adminMiddleware` |
| `/api/fdstaff` | `fdstaff.route.ts` | `authMiddleware` + `fdstaffMiddleware` |
| `/api/labstaff` | `labstaff.route.ts` | `authMiddleware` + `labstaffMiddleware` |

`doctor.route.ts` and `patient.route.ts` exist but are currently stubs / not mounted in `server.ts`.

Anything not matched by an API route falls through to `express.static(frontend/dist)`, so the backend also serves the built frontend in production — there's only one deployed service.

## Auth Notes (read before touching route files)

- Auth/role middleware on the backend is gated behind `ENV.IS_PRODUCTION` (see `backend/src/config/env.ts`) so routes are open during local development and enforced in production. `IS_PRODUCTION` is derived from `process.env.MODE`, falling back to `process.env.NODE_ENV`, trimmed and lowercased. **This gate is a footgun if the env var is misconfigured** — a typo, wrong var name, or missing value silently disables auth in production with no error. `env.ts` logs the resolved value on boot (`[env] MODE="..." NODE_ENV="..." -> IS_PRODUCTION=...`) — always check this in the Render logs after deploying.
- The frontend has a matching but separate guard, `frontend/src/lib/ProtectedRoute.tsx`, wrapped around each role route in `App.tsx`. It checks `import.meta.env.PROD` (Vite's built-in flag, `true` only in a `vite build` bundle) and, if in production, checks `localStorage` for a `token` and a `role` that's in the route's `allowedRoles`. **This is a UI convenience only** — it stops a role's dashboard from rendering when someone navigates to its URL directly, but it does not and cannot substitute for the backend checks, since anyone can call the API directly regardless of what the router does. Both layers must be correct independently.
- `role` is written to `localStorage` in `frontend/src/auth/LoginPage.tsx` at login, alongside `token`. If you add a logout flow, clear both keys together.

## Environment Variables

Backend (`backend/.env`, not committed):

```
PORT=5000
MODE=development           

DATABASE_URL=your_neon_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CORS_ORIGIN=http://localhost:5173,https://techcare-1.onrender.com
IS_PRODUCTION=false or pag prod true
```

On Render, set the same keys individually in the service's **Environment** dashboard (not a committed `.env` file) — use unquoted values, no trailing whitespace, and use different `JWT_SECRET`/`REFRESH_TOKEN_SECRET` values than local dev.

## Getting Started

Install and run both apps from the repo root:

```bash
npm run dev
```

This runs the backend dev server (`nodemon` + `tsx`, watching `backend/src`) on `http://localhost:5000`. For the frontend dev server (Vite, hot-reload) run in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

This serves the frontend on `http://localhost:5173` (proxied/CORS'd to the backend per `CORS_ORIGIN`).

### Production build

```bash
npm run build   # builds backend (tsc) then frontend (tsc -b && vite build)
npm start        # runs the compiled backend, which also serves frontend/dist
```

### Quick manual test

```bash
# after npm run dev in backend/
curl http://localhost:5000/api/test/ping
```

Then use Postman (or curl) with a `Bearer <token>` header from `/api/auth/login` to hit role-specific endpoints.

