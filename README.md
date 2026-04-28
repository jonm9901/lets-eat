# Let's Eat!

A family recipe and dinner planning app. Browse recipes, rate dishes, and plan the week's dinners on a shared calendar.

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Install & link Vercel CLI (one-time)
```bash
npm i -g vercel
vercel link
```

### 3. Add environment variables to Vercel project (one-time)
```bash
vercel env add DATABASE_URL      # Neon connection string (direct, not pooled)
vercel env add BLOB_READ_WRITE_TOKEN  # Vercel Blob token
vercel env add SITE_PASSWORD     # yumyum
```
Run each command twice — once for Production+Preview, once for Development.

### 4. Pull env vars locally
```bash
vercel env pull .env.local
```

### 5. Create tables and seed users
```bash
npm run setup-db
```

### 6. Start dev server
```bash
vercel dev
```

App runs at `http://localhost:3000` (or 3001 if 3000 is busy).

---

## Vercel Deployment

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the GitHub repo
3. Vercel auto-detects Vite — no build config changes needed
4. Environment variables are already set from step 3 above (they sync to your project)
5. Click **Deploy**
6. After the first deploy, run the DB setup against production:

```bash
# Option A: use the Vercel env directly
vercel env pull .env.production.local
DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d= -f2-) node scripts/setup-db.js
```

Or simply set `DATABASE_URL` in your shell and run `node scripts/setup-db.js`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL direct connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token |
| `SITE_PASSWORD` | Site password (default: `yumyum`) |

---

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS v4
- **API:** Vercel Serverless Functions (`/api`)
- **Database:** Neon PostgreSQL (`@neondatabase/serverless`)
- **Images:** Vercel Blob (`@vercel/blob`)
- **Hosting:** Vercel

## Default site password
`yumyum`
