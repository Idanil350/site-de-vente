<!-- .github/copilot-instructions.md -->
# Copilot / AI Agent Instructions for `ma-boutique`

Purpose: help an AI coding agent become productive quickly by describing the project's architecture, conventions, key files, and developer workflows.

**Big Picture**:
- **Framework**: Next.js (App Router, `app/` directory). The app uses Next 16 and React 19.
- **Server vs Client**: Files under `app/` are server components by default; client components include a top-line `'use client'` (see `components/ImageUpload.js`).
- **API routes**: Server route handlers live in `app/api/**` and use Next `route.js` handlers returning `NextResponse`.
- **Data layer**: MongoDB is used via two helpers in `lib/`: `lib/mongoose.js` (Mongoose, cached connection) and `lib/mongodb.js` (native `MongoClient` + `clientPromise`). Models live in `models/` and follow the Mongoose pattern used across the repo.

**Key directories & files** (quick references):
- `app/` : Next App Router pages, admin pages and API route handlers.
- `app/api/create-checkout-session/route.js` : Stripe Checkout session creation (uses `STRIPE_SECRET_KEY`).
- `app/api/upload/route.js` : Receives `FormData`, writes images to `public/images/`.
- `app/api/admin/login/route.js` + `app/admin/check-auth/route.js` + `app/admin/logout/route.js` : simple cookie-based admin auth (cookie name `admin-auth`).
- `lib/mongoose.js` : cached Mongoose connection — reuse this when working with Mongoose models.
- `lib/mongodb.js` : native Mongo client promise pattern for serverless-friendly use.
- `models/Order.js`, `models/Product.js` : define Mongoose models; note the `mongoose.models.Model || mongoose.model('Model', Schema)` pattern to avoid model recompilation.
- `components/ImageUpload.js`, `components/ProductCard.js`, `components/Header.js` : UI components; `ImageUpload` posts to `/api/upload` and expects `{ success, url }`.

**Concrete data flow examples**:
- Checkout/Order flow: Client calls `/api/create-checkout-session` (see `app/api/create-checkout-session/route.js`). That endpoint builds `line_items` from `items`, creates a Stripe session, and returns `sessionId`. Order data is passed via `metadata` or can be persisted by an `/api/orders` route which uses `models/Order.js`.
- Upload flow: `components/ImageUpload.js` sends a `POST` FormData to `/api/upload`; server writes the file to `public/images` and returns a relative URL (`/images/<name>`).
- Admin auth: `app/api/admin/login/route.js` sets an `admin-auth` cookie on successful POST (note: password currently hard-coded in the source). `app/admin/check-auth/route.js` reads the cookie for simple auth checks.

**Environment variables used in the repo** (search these before running):
- `MONGODB_URI` — used by `lib/mongoose.js` and `lib/mongodb.js`.
- `STRIPE_SECRET_KEY` — used in `app/api/create-checkout-session/route.js`.
- `NEXT_PUBLIC_BASE_URL` — used to build Stripe `success_url`/`cancel_url`.

**Developer workflows & commands**:
- Start dev server: `npm run dev` (script runs `next dev --webpack`).
- Build for production: `npm run build` then `npm run start`.
- Lint: `npm run lint` (uses `eslint`).
- When changing Mongoose models, follow the existing `mongoose.models.Model || mongoose.model('X', Schema)` pattern to avoid duplicate model registration errors in hot-reload.

**Project-specific conventions & gotchas**:
- The app uses both Mongoose (`lib/mongoose.js` + `models/`) and the native `mongodb` client (`lib/mongodb.js`). Prefer the helper that the target file already uses to avoid mixing connection strategies in a single file.
- Server-side route handlers return `NextResponse` objects (not express-style). Use `request.json()` or `request.formData()` as shown in existing handlers.
- Client/server boundary: only add `'use client'` to components that need hooks or browser APIs (see `components/ImageUpload.js`).
- Images uploaded by `app/api/upload/route.js` are saved inside the repo `public/images/` — the route returns the URL path. Tests or local workflows may require clearing that folder.
- Admin password is visible in `app/api/admin/login/route.js` as `ADMIN_PASSWORD = 'winshop2025'`. Do not commit environment secret changes without confirmation.

**When editing or adding features** (practical rules for an AI agent):
- Reuse helpers in `lib/` for DB connections — do not duplicate connection logic.
- Keep API route signatures consistent: use `POST` for mutations, read JSON via `await request.json()` and respond with `NextResponse.json(...)`.
- For Mongoose models, use the existing `export default mongoose.models.X || mongoose.model('X', Schema)` pattern.
- Avoid changing hard-coded secrets. If a change is required (move to env), propose it and call it out in PR text.

**Quick examples to copy/paste**:
1) Use cached mongoose connection:
   ```js
   import dbConnect from '../../lib/mongoose'
   await dbConnect()
   ```

2) Return JSON from a route handler:
   ```js
   import { NextResponse } from 'next/server'
   export async function POST(req) {
     const data = await req.json()
     return NextResponse.json({ success: true, data })
   }
   ```

**What to ask the repo owner** (if unclear):
- Preferred secret management for `ADMIN_PASSWORD` (keep hard-coded or move to env?).
- Any CI or deployment processes that require extra build flags or environment overrides.

If you want, I can also:
- Add a short `CONTRIBUTING.md` with the above developer commands, or
- Scan for other sensitive values and create a small checklist for secret rotation.

Please review and tell me which section needs more detail or if you'd like me to convert any of the notes into automated checks or PR templates.
