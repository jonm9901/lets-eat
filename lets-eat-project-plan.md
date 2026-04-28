# Let's Eat! — Claude Code Project Plan

**Version:** 1.1 (Updated: Neon DB + Vercel)
**Date:** April 2026
**Reference:** lets-eat-requirements.md

---

## Overview

This plan is structured for use with **Claude Code**. Each phase contains the exact prompt to paste, the expected outputs, and what to verify before moving on. Work through phases in order — each builds on the last.

**Tech Stack:**
- Frontend: React + Vite + Tailwind CSS
- API: Vercel Serverless Functions (`/api` directory)
- Database: Neon PostgreSQL via `@neondatabase/serverless`
- Image Storage: Vercel Blob (`@vercel/blob`)
- Hosting: Vercel

**Prerequisites before starting:**
- [ ] Neon account created at neon.tech — new project created, connection string copied
- [ ] Vercel account ready (same as used for ConcertSquad)
- [ ] GitHub repo created for this project

**Estimated sessions:** 5–7 Claude Code sessions
**Estimated build time:** 3–5 hours

---

## Standard Context Block

Paste this at the top of **every** Claude Code session to keep it oriented:

```
I'm building a family recipe web app called "Let's Eat!" deployed on Vercel with a Neon PostgreSQL database and Vercel Blob for image storage. Reference file: lets-eat-requirements.md.

Tech stack: React + Vite + Tailwind CSS (frontend), Vercel Serverless Functions in /api (backend), @neondatabase/serverless (database), @vercel/blob (image uploads).

Design system: background #FAF6F0 (warm cream), accent #C4622D (terracotta), secondary #7D9B76 (sage green), text #1C1C1C. Fonts: Playfair Display (headings), Nunito (body) from Google Fonts.

4 pre-seeded users: Jon (admin, #C0392B), Wendy (member, #8E44AD), Noah (member, #2980B9), Kaden (member, #27AE60). Site password: "yumyum" (stored in SITE_PASSWORD env var).
```

---

## Phase 1 — Project Scaffold, Config & Database Setup

### Goal
Create the full project structure, configure Vercel, install all dependencies, connect Neon DB, run the schema migration, and seed users.

### Before You Start
- Have your Neon connection string ready (from neon.tech dashboard)
- Format: `postgresql://user:password@host.neon.tech/dbname?sslmode=require`

### Claude Code Prompt

```
[PASTE STANDARD CONTEXT BLOCK HERE]

Create a new project called "lets-eat" with the following setup:

PROJECT STRUCTURE:
- Single repo with React + Vite frontend at root level
- /api directory for Vercel serverless functions
- /src for React frontend source

DEPENDENCIES TO INSTALL:
Frontend: react, react-dom, react-router-dom, axios, tailwindcss, @tailwindcss/vite
API/Backend: @neondatabase/serverless, @vercel/blob, open-graph-scraper, multiparty (for multipart form parsing in serverless functions)

VITE CONFIG (vite.config.js):
- Configure the dev server to proxy /api requests to the Vercel dev server (or use vercel dev for local development)

TAILWIND CONFIG:
- Configure content paths for ./src/**/*.{js,jsx}
- Add Playfair Display and Nunito from Google Fonts in index.html

VERCEL CONFIG (vercel.json):
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}

DATABASE SETUP:
Create a script at scripts/setup-db.js that:
1. Connects to Neon using DATABASE_URL from environment
2. Creates these tables if they don't exist:
   - users: id SERIAL PK, name TEXT NOT NULL, role TEXT DEFAULT 'member', avatar_color TEXT NOT NULL
   - recipes: id SERIAL PK, name TEXT NOT NULL, description TEXT, ingredients TEXT, link_url TEXT, blob_url TEXT, image_url TEXT, added_by_user_id INTEGER REFERENCES users(id), created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
   - ratings: id SERIAL PK, recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE, user_id INTEGER REFERENCES users(id), stars INTEGER CHECK (stars BETWEEN 1 AND 5), rated_at TIMESTAMPTZ DEFAULT NOW(), UNIQUE(recipe_id, user_id)
   - calendar_entries: id SERIAL PK, recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL, dinner_date DATE NOT NULL UNIQUE, assigned_by_user_id INTEGER REFERENCES users(id), assigned_at TIMESTAMPTZ DEFAULT NOW()
3. Seeds users if the users table is empty:
   INSERT INTO users (name, role, avatar_color) VALUES
     ('Jon', 'admin', '#C0392B'),
     ('Wendy', 'member', '#8E44AD'),
     ('Noah', 'member', '#2980B9'),
     ('Kaden', 'member', '#27AE60');

ENV FILES:
- .env.local with placeholders: DATABASE_URL=, BLOB_READ_WRITE_TOKEN=, SITE_PASSWORD=yumyum
- Add .env.local to .gitignore

PACKAGE.JSON SCRIPTS:
- "dev": "vercel dev" (uses Vercel CLI for local dev, serving both frontend and /api)
- "build": "vite build"
- "setup-db": "node scripts/setup-db.js"

Create a minimal src/App.jsx with react-router-dom routes for /, /profiles, /library, /calendar — all showing placeholder text for now.

Create a README.md with setup steps:
1. npm install
2. Fill in .env.local with Neon connection string and Vercel Blob token
3. npm run setup-db
4. npm run dev (requires Vercel CLI: npm i -g vercel)
```

### Verify Before Continuing
- [ ] `npm run setup-db` runs without errors and creates tables + seeds 4 users
- [ ] `npm run dev` starts without errors
- [ ] Visiting localhost:3000 shows the placeholder app

---

## Phase 2 — All API Routes

### Goal
Build every serverless API endpoint before touching UI.

### Claude Code Prompt

```
[PASTE STANDARD CONTEXT BLOCK HERE]

Implement all Vercel serverless API functions in the /api directory. Use @neondatabase/serverless for all DB queries (import { neon } from '@neondatabase/serverless' and const sql = neon(process.env.DATABASE_URL)).

Each file exports a default async function handler(req, res).

--- api/auth/verify.js ---
POST only. Read body.password. Compare to process.env.SITE_PASSWORD.
Return { success: true } or { success: false }.

--- api/users/index.js ---
GET only. Return all users ordered by id.

--- api/recipes/index.js ---
GET: Return all recipes with:
  - All recipe fields
  - added_by_name (join users.name)
  - average_rating (AVG of ratings.stars, null if none)
  - rating_count (COUNT of ratings)
Accept query params: sort = 'newest' (default) | 'alpha' | 'top_rated'

POST: Insert new recipe. Body: { name, description, ingredients, link_url, image_url, added_by_user_id }
Return the created recipe row.

--- api/recipes/[id].js ---
GET: Return full recipe detail including:
  - All recipe fields + added_by_name
  - average_rating, rating_count
  - per_user_ratings: array of all 4 users with { user_id, user_name, stars } (stars is null if not yet rated)
  - calendar_appearances: array of { dinner_date } where this recipe has been scheduled (most recent first, limit 10)

PUT: Update recipe fields from body. Update updated_at = NOW(). Return updated recipe.

DELETE: Only allow if role check passes (caller passes user_id in body; verify user is admin).
Delete recipe. Ratings cascade. Calendar entries set recipe_id to NULL.
Return { success: true }.

--- api/recipes/[id]/image.js ---
POST: Accept multipart form upload using multiparty package.
Parse the file, then upload to Vercel Blob using put() from @vercel/blob.
Update recipes.blob_url with the returned Blob URL.
Return { blob_url }.

--- api/recipes/og-image.js ---
GET with ?url= query param.
Use open-graph-scraper to fetch og:image from the URL.
Return { og_image_url } or { og_image_url: null } on failure.
Wrap in try/catch — never throw errors to the client.

--- api/ratings/index.js ---
POST: Body: { recipe_id, user_id, stars }
Upsert using INSERT ... ON CONFLICT (recipe_id, user_id) DO UPDATE SET stars = EXCLUDED.stars, rated_at = NOW()
Return the upserted rating row.

--- api/calendar/index.js ---
GET: Query params start (YYYY-MM-DD) and end (YYYY-MM-DD).
Return all calendar_entries in that range with recipe name, average_rating, blob_url, image_url.

POST: Body: { recipe_id, dinner_date, assigned_by_user_id }
Upsert: INSERT ... ON CONFLICT (dinner_date) DO UPDATE SET recipe_id = EXCLUDED.recipe_id, assigned_by_user_id = EXCLUDED.assigned_by_user_id, assigned_at = NOW()
Return the entry.

--- api/calendar/[date].js ---
DELETE: Delete calendar_entry for the given date. Return { success: true }.

Add CORS headers to all handlers (allow all origins for simplicity since the app is family-only).
```

### Verify Before Continuing
- [ ] Test each endpoint with curl or the Vercel dev server
- [ ] `POST /api/auth/verify` with `{"password":"yumyum"}` returns `{"success":true}`
- [ ] `GET /api/users` returns 4 users
- [ ] `POST /api/recipes` creates a recipe; `GET /api/recipes` returns it
- [ ] `POST /api/ratings` saves a rating; `GET /api/recipes/:id` shows per-user breakdown
- [ ] `POST /api/calendar` assigns a recipe to a date; `GET /api/calendar` returns it

---

## Phase 3 — Auth Flow: Site Password + Profile Picker

### Goal
Build the two entry screens with the full design system established.

### Claude Code Prompt

```
[PASTE STANDARD CONTEXT BLOCK HERE]

Build the authentication entry flow for Let's Eat! in the React frontend.

SHARED SETUP:
1. Create src/context/AuthContext.jsx exporting AuthProvider and useAuth hook.
   State: { isAuthenticated: bool, activeUser: { id, name, role, avatar_color } | null }
   On mount, read both from localStorage.
   Methods: login() sets isAuthenticated=true in localStorage, setActiveUser(user) saves user to localStorage, logout() clears both and redirects to /.

2. Wrap App.jsx in AuthProvider.

3. Create a ProtectedRoute component: if !isAuthenticated redirect to /, if !activeUser redirect to /profiles.

SITE PASSWORD SCREEN (src/pages/SitePassword.jsx) — route: /:
- Full-page, background #FAF6F0
- Centered card (max-width 420px, white background, rounded-2xl, soft shadow)
- At top: SVG logo — "Let's Eat!" text in Playfair Display + a simple crossed fork & spoon SVG icon beside it, all in terracotta #C4622D
- Tagline below: "The family recipe book" in Nunito, muted color
- Password input (type=password, placeholder="Enter the secret password")
- Terracotta submit button "Let's Go →"
- On submit: POST /api/auth/verify. On success call login() and navigate to /profiles.
- On fail: show friendly shake animation on the card + message "Hmm, that's not right! 🍴"
- On mount: if already authenticated, redirect to /profiles

PROFILE PICKER (src/pages/ProfilePicker.jsx) — route: /profiles:
- If !isAuthenticated, redirect to /
- Background #FAF6F0, full-page centered
- Heading: "Who's cooking tonight? 👋" in Playfair Display, 2.5rem
- Fetch all users from GET /api/users
- Display as a row (flex, wrap on mobile) of profile cards, each:
  - Circle avatar 120px, background = user.avatar_color, white initial letter centered, font-size 2.5rem, Playfair Display
  - User name below in Nunito, 1.1rem
  - Hover: scale(1.08), soft shadow, cursor pointer
  - Smooth transition on hover
- On click: call setActiveUser(user), navigate to /library

NAVIGATION BAR (src/components/NavBar.jsx):
- Shown on /library and /calendar only (not on / or /profiles)
- Sticky top, white background, subtle bottom border
- Left: "Let's Eat!" logo (small, links to /library)
- Center: "Library" and "Calendar" nav links (terracotta underline on active)
- Right: user avatar circle (40px, avatar_color bg, white initial) + name, clicking opens a small dropdown with "Switch Profile" option (calls logout() to clear activeUser only and navigate to /profiles)

Update App.jsx routes:
- / → SitePassword
- /profiles → ProfilePicker
- /library → placeholder protected by ProtectedRoute
- /calendar → placeholder protected by ProtectedRoute
```

### Verify Before Continuing
- [ ] Wrong password shows shake animation + error
- [ ] Correct password navigates to profile picker
- [ ] All 4 user avatars shown with correct colors
- [ ] Clicking a profile navigates to /library placeholder
- [ ] Refreshing the page keeps you logged in
- [ ] "Switch Profile" clears the active user and returns to /profiles

---

## Phase 4 — Recipe Library

### Goal
Build the full recipe library: browsing, adding, editing, rating, and viewing recipes.

### Claude Code Prompt

```
[PASTE STANDARD CONTEXT BLOCK HERE]

Build the complete Recipe Library at /library. It is protected by ProtectedRoute (authenticated + activeUser set).

LIBRARY PAGE (src/pages/Library.jsx):
- Page title "Recipe Library" in Playfair Display, 2rem
- Top bar: search text input (realtime filter on recipe name) + sort select (Newest First / A–Z / Top Rated — pass as sort param to API)
- Fetch recipes from GET /api/recipes?sort=... on mount and when sort changes
- Search filters the fetched list client-side by name
- Recipe card grid: 3 columns desktop, 2 tablet (md), 1 mobile. gap-6, p-6
- Floating "+" FAB button: fixed bottom-right, 56px circle, terracotta bg, white "+" icon, slight shadow
- Loading state: show 6 skeleton cards (cream shimmer animation)
- Empty state: centered illustration message "No recipes yet — add your first one! 🍽️" with an Add Recipe button

RECIPE CARD (src/components/RecipeCard.jsx):
- White background, rounded-2xl, overflow-hidden, shadow-sm, hover: shadow-md + translateY(-4px), transition 200ms
- Image area (200px tall): show blob_url OR image_url OR og-scraped (handle in parent). If no image, show a warm SVG food placeholder (a simple illustrated bowl or plate in terracotta/sage tones)
- Recipe name in Playfair Display, 1.1rem, 2 lines max (line-clamp-2)
- "Added by [name]" in small muted Nunito text
- Star rating row: filled/empty stars + "X.X ★ (N)" — if no ratings: "No ratings yet"
- If activeUser has rated this recipe: show their rating as a small badge (e.g. "You: ★★★★")
- On click: navigate to /recipes/:id

RECIPE DETAIL PAGE (src/pages/RecipeDetail.jsx) — route: /recipes/:id:
- Fetch from GET /api/recipes/:id
- Hero image (300px tall, full width, object-fit cover, rounded-xl) or placeholder
- Recipe name in Playfair Display, 2rem
- "Added by [name] · [date formatted as Month D, YYYY]" in muted small text
- Description (if set): paragraph in Nunito
- Ingredients (if set): rendered as a bulleted list (split on newlines)
- "View Full Recipe →" button (outlined terracotta) if link_url set — opens in new tab
- RATINGS SECTION:
  - Heading "Family Ratings" in Playfair Display
  - Large average: e.g. "4.2 ★" (2rem, terracotta) + "(3 ratings)"
  - Per-user breakdown: 4 rows, each showing avatar circle (32px) + name + star display (filled/empty) or "Not yet rated" in muted text
  - Current user's interactive rating: 5 star buttons below their row. Click calls POST /api/ratings then refreshes. Show a brief "Rating saved!" toast.
- CALENDAR HISTORY:
  - If calendar_appearances has entries: show small section "Past Dinners" listing dates (formatted nicely)
- Back button "← Back to Library" in muted text
- Edit button (pencil icon): shown if activeUser.id === recipe.added_by_user_id OR activeUser.role === 'admin'. Opens Edit modal.
- Delete button (trash icon, red): shown only if activeUser.role === 'admin'. Shows confirmation dialog. On confirm: DELETE /api/recipes/:id then navigate to /library.

ADD / EDIT RECIPE MODAL (src/components/RecipeModal.jsx):
- Slide-up or scale-in modal overlay, white card, max-width 560px
- Title: "Add Recipe" or "Edit Recipe" in Playfair Display
- Fields:
  - Name* (text input, required)
  - Description (textarea, 3 rows)
  - Ingredients (textarea, 5 rows, placeholder "One ingredient per line")
  - Recipe Link (URL input)
- IMAGE SECTION — three tab/toggle options:
  1. Upload Photo: drag-and-drop zone (dashed border, terracotta accent on drag-over). On file select, show preview. On save, POST /api/recipes/:id/image with FormData.
  2. Image URL: text input with live preview of the URL
  3. Auto: message "We'll try to pull an image from your recipe link when you save"
- Save button "Save Recipe" (terracotta, full-width)
- On create: POST /api/recipes. After save, if image tab = Upload and file selected, POST /api/recipes/:id/image. Then if tab = Auto and link_url set, GET /api/recipes/og-image?url=..., and if og_image_url returned, PUT /api/recipes/:id with { image_url: og_image_url }. Then close modal + refresh library + show toast "Recipe saved! 🍽️"
- On edit: PUT /api/recipes/:id with changed fields. Same image handling logic.

TOAST SYSTEM (src/components/Toast.jsx):
- Fixed top-right, z-50. Auto-dismiss after 3 seconds. Smooth slide-in/out animation.
- Variants: success (sage green) and error (red).
- Create a useToast() hook / context to trigger from anywhere.
```

### Verify Before Continuing
- [ ] Library loads and shows recipe cards
- [ ] Search and sort work
- [ ] Add recipe creates a new card; all 3 image options work
- [ ] Recipe detail shows all fields, ratings breakdown, edit/delete controls
- [ ] Ratings can be submitted and update in real time
- [ ] Edit and delete work correctly with permission checks

---

## Phase 5 — Weekly Dinner Calendar

### Goal
Build the weekly dinner calendar with recipe assignment, history, and navigation.

### Claude Code Prompt

```
[PASTE STANDARD CONTEXT BLOCK HERE]

Build the Weekly Dinner Calendar at /calendar. Protected by ProtectedRoute.

CALENDAR PAGE (src/pages/Calendar.jsx):

STATE:
- currentWeekStart: a Date object always set to the Monday of the displayed week
- calendarData: object keyed by YYYY-MM-DD date strings → { recipe_id, recipe_name, average_rating, blob_url, image_url }

On mount and whenever currentWeekStart changes: fetch GET /api/calendar?start=YYYY-MM-DD&end=YYYY-MM-DD (start = Monday, end = Sunday of current week). Map results into calendarData state.

WEEK HEADER:
- Display "April 21 – April 27, 2026" style label in Playfair Display
- Left arrow (←) to go back one week: setCurrentWeekStart(subtract 7 days)
- Right arrow (→) to go forward one week
- "Today" button: reset to the Monday of the current real week

CALENDAR GRID:
- 7 columns (Mon–Sun), each column is a DayCell component
- On mobile: single column vertical stack

DAY CELL (src/components/DayCell.jsx):
Props: date (Date), entry (recipe data or null), isPast (bool), onAssign, onRemove

If entry exists:
  - Recipe thumbnail (60x60px, object-fit cover, rounded-lg) or food placeholder
  - Recipe name (font-medium, truncate, max 2 lines)
  - Average rating badge (small, terracotta stars)
  - If !isPast: show "×" button (small, top-right of card) to clear the slot (calls onRemove)
  - If !isPast: show "↕" swap button to change (calls onAssign with the date)
  - If isPast: muted styling (opacity-60, no edit controls)

If no entry:
  - If !isPast: dashed border box with "+" icon and "Add Dinner" text. onClick calls onAssign(date).
  - If isPast: empty muted box showing just the date

Day column header:
  - Day abbreviation (Mon, Tue, etc.) — bold if today
  - Date number (21, 22, etc.)
  - Today's column: terracotta left border accent or light terracotta background header

RECIPE PICKER MODAL (src/components/RecipePicker.jsx):
Triggered by onAssign(date).
- Modal overlay, white card, max-width 480px
- Title: "Dinner for [Wednesday, April 23]" in Playfair Display
- Search input at top (filters list in real time)
- Fetch all recipes from GET /api/recipes on open (or use cached if available)
- Scrollable list: each row = thumbnail (40px) + recipe name + avg rating
- On row click: POST /api/calendar { recipe_id, dinner_date: 'YYYY-MM-DD', assigned_by_user_id: activeUser.id }
  Then close modal, refresh calendar for the week, show toast "Dinner planned! 🍴"

REMOVE SLOT:
On "×" click: DELETE /api/calendar/:date. Refresh calendar. Show toast.

PAST WEEK BEHAVIOR:
- isPast = true if the date is before today
- Past entries are read-only (no controls shown)
- Navigating back to past weeks shows the dinner history

DATE HELPERS (src/utils/dateHelpers.js):
Create helper functions: getMondayOfWeek(date), formatWeekRange(monday), formatDisplayDate(date), isDateInPast(date), dateToYMD(date)
```

### Verify Before Continuing
- [ ] Weekly calendar renders with correct Mon–Sun columns
- [ ] Today is highlighted
- [ ] Clicking empty slot opens recipe picker
- [ ] Picking a recipe assigns it and shows on the calendar
- [ ] "×" clears a slot
- [ ] Past days are read-only and muted
- [ ] Navigating to past weeks shows dinner history
- [ ] "Today" button returns to current week

---

## Phase 6 — Polish, Mobile & Deployment

### Goal
Refine visuals, fix mobile, add final touches, and deploy to Vercel.

### Claude Code Prompt

```
[PASTE STANDARD CONTEXT BLOCK HERE]

Polish and finalise Let's Eat! with these improvements, then prepare for Vercel deployment.

VISUAL POLISH:
1. Add smooth page transition: wrap route changes in a fade (opacity 0→1, 200ms) using CSS or a simple React transition
2. Add loading skeleton for recipe cards: cream rectangles with a shimmer/pulse animation matching the card shape
3. Recipe cards: add hover micro-interaction — scale(1.02) + shadow-lg, transition 200ms ease
4. All modals: animate open with scale(0.95)→scale(1) + opacity fade (150ms)
5. Star rating picker: progressive hover highlight — hovering star 3 fills stars 1–3 in terracotta; clicked state locks it in with a brief pop scale animation
6. NavBar active link: terracotta underline with a smooth 2px slide-in transition

BRANDING:
7. Create a polished SVG logo for "Let's Eat!" featuring a fork and spoon motif in terracotta. Use this in:
   - The NavBar (32px tall)
   - The SitePassword screen (80px tall)
   - As an SVG favicon (link in index.html)
8. Set browser tab title to "Let's Eat! 🍴"

MOBILE AUDIT (test at 375px width):
9. Ensure all screens have no horizontal overflow — check every page
10. Calendar: on mobile (below md breakpoint) render as a vertical stack of day cards instead of a 7-column grid. Each card shows the full day info.
11. Modals: full-screen on mobile (100vw, 100vh, no border-radius)
12. NavBar: collapse center links into a hamburger menu on mobile, or move below the logo/profile row

EDGE CASES:
13. If og-image fetch fails or times out, silently use placeholder — no error shown to user
14. Before deleting a recipe, show: "Delete [Recipe Name]? This will also remove it from the calendar." — styled confirm dialog (not browser alert)
15. If assigning a recipe to a date that already has one, the API upserts — but show a brief note in the picker: "This will replace the current selection."

VERCEL DEPLOYMENT:
16. Confirm vercel.json is correct for SPA routing + /api functions
17. Create a scripts/setup-db.js that can be run once after deployment (node scripts/setup-db.js with DATABASE_URL set)
18. Ensure all environment variables are documented in README.md
19. Update README.md with:
    - Project description
    - Local setup (npm install, fill .env.local, npm run setup-db, npm run dev)
    - Vercel deployment steps (import repo, set env vars, deploy, run setup-db)
    - Default site password: yumyum
```

### Verify Before Continuing
- [ ] App looks polished on desktop at 1280px
- [ ] App is fully usable on mobile at 375px
- [ ] Logo appears correctly in navbar and password screen
- [ ] Deployed to Vercel with all 3 env vars set
- [ ] setup-db runs against the production Neon DB
- [ ] All 4 profiles work on the deployed URL

---

## Phase 7 — Optional Future Enhancements

These are great follow-up sessions with Claude Code after v1 ships:

- **Recipe tags/categories** (Italian, Quick, Vegetarian) with filter chips in the library
- **Meal notes** on the calendar ("kids loved this one!")
- **"Make again" counter** — tracked automatically from calendar entries
- **Favorites** — heart button per user, separate Favorites view
- **Shopping list** — auto-generated from a week's calendar recipes' ingredients
- **Recipe history on detail page** — visual timeline of when it was cooked
- **Dark mode** toggle
- **Export calendar** as a printable/shareable weekly plan

---

## Troubleshooting Tips for Claude Code

- **Neon connection errors:** Ensure `DATABASE_URL` includes `?sslmode=require` at the end
- **Vercel Blob errors:** The `BLOB_READ_WRITE_TOKEN` must be set in both `.env.local` and Vercel dashboard env vars
- **OG scraping failures:** These are expected for some URLs — always handle with try/catch and return `{ og_image_url: null }`
- **Serverless function cold starts:** Neon's serverless driver handles connection pooling — use `neon()` (HTTP-based), not `Pool`, for serverless environments
- **SPA routing on Vercel:** The `vercel.json` rewrite rule for `"/(.*)" → "/index.html"` is essential for react-router to work on direct URL access
- **multiparty for file uploads:** Standard `multer` doesn't work in Vercel serverless — use `multiparty` to parse multipart form data instead
- **CORS in serverless functions:** Add `res.setHeader('Access-Control-Allow-Origin', '*')` and handle OPTIONS preflight in each function
