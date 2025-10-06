# Pen — Design tool built using React

![Watch the demo](https://pub-6b4df72604794d4d8fa718147c3e2837.r2.dev/design-tool.mp4)

This app uses:

- React + Vite for the frontend
- Convex for data and auth (Google + Anonymous)
- A Cloudflare Worker (Hono) for image uploads to R2
- Optional Unsplash integration for image search

## Prerequisites

- Node.js 18+ and pnpm
- A Convex project (free tier is fine)
- A Google OAuth Client (for auth)
- Cloudflare account with:
  - Wrangler installed (`npm i -g wrangler` or use `pnpm dlx wrangler`)
  - An R2 bucket and API tokens

## Environment variables

Create `.env` in the repo root (copy from `env.example`) and add:

```bash
VITE_CONVEX_URL= # Convex deployment URL (shown by `npx convex dev`)
VITE_UNSPLASH_ACCESS_KEY= # optional, for Unsplash search
```

Worker secrets and vars are managed by Wrangler. You will set these via commands below:

- `R2_ENDPOINT` — your account ID (or endpoint subdomain) for R2, without protocol
- `R2_ACCESS_KEY_ID` — R2 Access Key ID
- `R2_SECRET_ACCESS_KEY` — R2 Secret Access Key
- `R2_BUCKET_NAME` — name of your R2 bucket
- `ENVIRONMENT` — `development` or `production` (already set in `workers/wrangler.jsonc` as `development`)

## Install

```bash
pnpm install
```

## Start services locally

You can run the three parts side-by-side.

### 1) Convex (backend)

- Make sure you are logged in and linked to a Convex project.

```bash
npx convex dev
```

This serves Convex locally and prints a URL. Copy that into your `.env` as `VITE_CONVEX_URL`.

### 2) Cloudflare Worker (file uploads)

The worker listens for image uploads and writes them to R2.

- From `workers/` directory, install and run dev:

```bash
cd workers
pnpm install
pnpm run dev
```

This starts the worker on a local port (Wrangler chooses it; in code we use `POST /upload-file`). The frontend currently points to `http://localhost:65214/upload-file` by default. If Wrangler chooses a different port, update the URL in `src/components/ImagePicker.tsx` or set a fixed port with `wrangler dev --port 65214`.

- Set worker secrets (one-time, in `workers/`):

```bash
pnpm wrangler secret put R2_ACCESS_KEY_ID
pnpm wrangler secret put R2_SECRET_ACCESS_KEY
```

- Set worker vars (either in `workers/wrangler.jsonc` or via CLI):

```bash
pnpm wrangler kv:namespace create dummy  # not required; example pattern only
# Set vars (preferred via wrangler.jsonc "vars")
# or use: pnpm wrangler secret put R2_ENDPOINT; pnpm wrangler secret put R2_BUCKET_NAME
```

In code, the worker expects `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.

### 3) Frontend (Vite)

In the repo root:

```bash
pnpm run dev
```

Vite runs on `http://localhost:5173`.

## How the pieces connect

- Frontend authenticates via Convex using Google or Anonymous. Convex routes are added in `convex/http.ts`, provider config is in `convex/auth.ts` and `convex/auth.config.ts`.
- App initializes Convex client using `import.meta.env.VITE_CONVEX_URL` in `src/main.tsx`.
- Image uploads: the frontend posts to the worker `POST /upload-file`, which stores the file in R2 using AWS S3-compatible API. See `workers/src/routes/UploadFile.ts` and `workers/src/index.ts`.
- Unsplash: if `VITE_UNSPLASH_ACCESS_KEY` is set, the image picker can search Unsplash.

## Deployment notes

- Convex: deploy per Convex docs (`npx convex deploy`). Update `VITE_CONVEX_URL` to the production URL.
- Worker: from `workers/` run `pnpm run deploy` to Cloudflare. Configure DNS/route as needed.
- Frontend: run `pnpm run build` and host `dist/` (Vercel/Netlify/etc.). If using a custom worker domain for uploads, update the upload URL in `src/components/ImagePicker.tsx`.
