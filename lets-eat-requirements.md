# Let's Eat! — Product Requirements Document

**Version:** 1.1 (Updated: Neon DB + Vercel)
**Date:** April 2026
**Owner:** Jon (Admin)

---

## 1. Overview

**Let's Eat!** is a family-facing web application for managing dinner recipes and planning weekly meals. Family members can browse a shared recipe library, add new recipes, rate dishes they've tried, and schedule meals on a weekly dinner calendar. The app is designed to be simple, warm, and enjoyable to use by all family members including children.

The app is deployed on **Vercel** with a **Neon PostgreSQL** database, making it accessible from any device on any network.

---

## 2. Users & Authentication

### 2.1 Site Password
- The app is protected by a single shared site password: **`yumyum`**
- Any visitor must enter this password before accessing the app
- Once entered, the password is stored in the browser (localStorage) so users are not re-prompted on return visits to the same device

### 2.2 Profile Selection
- After passing the site password, users see a **Netflix-style profile picker** showing all four family profiles
- Each profile displays the user's name and a colored avatar
- No individual passwords — simply click your name to select your profile
- The active profile is stored in localStorage so the user doesn't have to re-pick within a single browsing session

### 2.3 Pre-Registered Users

| Name  | Role   |
|-------|--------|
| Jon   | Admin  |
| Wendy | Member |
| Noah  | Member |
| Kaden | Member |

### 2.4 Admin Capabilities (Jon only)
- Delete any recipe from the library
- Remove a recipe from the calendar
- Edit any recipe (not just ones they created)
- All other actions are available to all users

---

## 3. Recipe Library

### 3.1 Recipe Card Fields

| Field           | Required | Notes |
|-----------------|----------|-------|
| Name            | ✅ Yes   | Plain text, recipe title |
| Description     | ❌ No    | Short freeform text |
| Ingredients     | ❌ No    | Freeform text or line-by-line list |
| Recipe Link     | ❌ No    | URL to external recipe source |
| Photo           | ❌ No    | See section 3.2 |
| Added By        | Auto     | Set to the active profile at time of creation |
| Date Added      | Auto     | Timestamp of when recipe was created |

### 3.2 Recipe Image Handling (priority order)
1. **Uploaded Photo** — user uploads an image file (JPG, PNG, WebP); stored in **Vercel Blob**
2. **Image URL** — user pastes a direct image URL
3. **Auto-Thumbnail** — if a Recipe Link is provided and no image is set, the app attempts to extract the `og:image` meta tag from the linked page
4. **Default Placeholder** — warm illustrated food placeholder shown if no image is found

### 3.3 Recipe Library Features
- **Browse view:** Card-based grid layout showing all recipes
- **Search:** Filter recipes by name in real time
- **Sort options:** By name (A–Z), by date added (newest first), by average star rating (highest first)
- **Recipe detail view:** Full recipe card with all fields, ratings breakdown, and calendar history
- **Add recipe:** Any logged-in user can add a recipe
- **Edit recipe:** The user who added it can edit it; admin can edit any
- **Delete recipe:** Admin only

---

## 4. Star Ratings

### 4.1 Rating Model
- Each family member can submit **one rating (1–5 stars)** per recipe
- Ratings can be updated at any time (re-rating replaces the previous)
- Ratings are stored per user per recipe in the database

### 4.2 Rating Display
- **Average rating** displayed prominently (e.g. "4.2 ★")
- **Breakdown panel** showing each family member's individual rating
- Users who have not yet rated show as "Not yet rated"
- Rating can be submitted from both the recipe card and the full detail view

---

## 5. Dinner Calendar

### 5.1 Calendar View
- Primary view: **Weekly calendar (Monday–Sunday)**
- Navigation: Previous/Next week arrows + "Today" button
- Each day shows the assigned dinner recipe or an empty "Add dinner" slot

### 5.2 Scheduling Meals
- Any user can assign a recipe to any future or current dinner slot
- Clicking an empty slot opens a searchable **recipe picker** modal
- A recipe can appear on the calendar multiple times on different dates
- One recipe per dinner slot per day

### 5.3 Past Meals
- Past dinner slots are shown in a muted/read-only style
- Past weeks are fully browsable — the calendar serves as permanent dinner history

### 5.4 Removing / Changing a Meal
- Any user can change a future dinner slot
- Admin can clear any slot including past ones
- Clearing a slot does not delete the recipe from the library

---

## 6. Design & UI

### 6.1 Design Direction
- **Tone:** Warm, clean, family-friendly — like a beautifully designed family cookbook
- **Aesthetic:** Editorial/organic — generous whitespace, card-based layout, food photography as hero imagery
- **Color palette:** Warm cream background `#FAF6F0`, terracotta accent `#C4622D`, sage green `#7D9B76`, near-black text `#1C1C1C`
- **Typography:** Playfair Display (headings, loaded from Google Fonts), Nunito (body text)
- **Logo:** "Let's Eat!" wordmark with a small fork/spoon SVG icon in terracotta

### 6.2 Key Screens
1. **Site Password Screen** — centered card, logo prominent, single password input
2. **Profile Picker** — large circular avatars with names, warm greeting ("Who's cooking tonight?")
3. **Recipe Library** — responsive card grid, top search + sort bar, floating "Add Recipe" button
4. **Recipe Detail** — hero image, all fields, ratings section, calendar appearances
5. **Add/Edit Recipe Form** — clean form with drag-and-drop image upload area
6. **Weekly Calendar** — 7-column grid, current day highlighted, past days muted
7. **Recipe Picker Modal** — searchable overlay triggered from empty calendar slots

### 6.3 Responsive Design
- Fully functional on desktop and tablet
- Mobile-friendly (single-column stacked layout on small screens)
- Calendar stacks to a vertical day list on mobile

### 6.4 Navigation
- Persistent top nav bar: logo (links to library), Library link, Calendar link, active profile avatar + name with option to switch profile

---

## 7. Data Storage

### 7.1 Database — Neon PostgreSQL
All relational data is stored in a **Neon** serverless PostgreSQL database accessed via `@neondatabase/serverless`. The connection string is stored as `DATABASE_URL` in environment variables.

**Schema:**

```sql
-- Users (seeded, not user-managed)
CREATE TABLE users (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL DEFAULT 'member',
  avatar_color TEXT NOT NULL
);

-- Recipes
CREATE TABLE recipes (
  id               SERIAL PRIMARY KEY,
  name             TEXT NOT NULL,
  description      TEXT,
  ingredients      TEXT,
  link_url         TEXT,
  blob_url         TEXT,        -- Vercel Blob URL for uploaded photo
  image_url        TEXT,        -- Manual image URL
  added_by_user_id INTEGER REFERENCES users(id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Ratings (one per user per recipe)
CREATE TABLE ratings (
  id        SERIAL PRIMARY KEY,
  recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
  user_id   INTEGER REFERENCES users(id),
  stars     INTEGER CHECK (stars BETWEEN 1 AND 5),
  rated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

-- Calendar (one recipe per date)
CREATE TABLE calendar_entries (
  id                  SERIAL PRIMARY KEY,
  recipe_id           INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
  dinner_date         DATE NOT NULL UNIQUE,
  assigned_by_user_id INTEGER REFERENCES users(id),
  assigned_at         TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed data:**
```sql
INSERT INTO users (name, role, avatar_color) VALUES
  ('Jon',   'admin',  '#C0392B'),
  ('Wendy', 'member', '#8E44AD'),
  ('Noah',  'member', '#2980B9'),
  ('Kaden', 'member', '#27AE60');
```

### 7.2 Image Storage — Vercel Blob
- Uploaded recipe photos are stored in **Vercel Blob** using `@vercel/blob`
- The returned public URL is saved in `recipes.blob_url`
- Requires `BLOB_READ_WRITE_TOKEN` environment variable

---

## 8. Technical Requirements

### 8.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Routing | react-router-dom |
| API | Vercel Serverless Functions (`/api` directory) |
| Database | Neon PostgreSQL via `@neondatabase/serverless` |
| Image Storage | Vercel Blob (`@vercel/blob`) |
| OG Scraping | `open-graph-scraper` (serverless function) |
| Hosting | Vercel |

### 8.2 Project Structure
```
lets-eat/
├── api/                          # Vercel serverless functions
│   ├── auth/
│   │   └── verify.js
│   ├── recipes/
│   │   ├── index.js              # GET all, POST new
│   │   ├── [id].js               # GET one, PUT, DELETE
│   │   ├── [id]/
│   │   │   └── image.js          # POST upload → Vercel Blob
│   │   └── og-image.js           # GET ?url= scrape
│   ├── ratings/
│   │   └── index.js              # POST upsert rating
│   └── calendar/
│       ├── index.js              # GET range, POST assign
│       └── [date].js             # DELETE entry
├── src/                          # React frontend
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── assets/
├── public/
├── vercel.json
├── vite.config.js
├── tailwind.config.js
└── package.json
```

### 8.3 Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Vercel dashboard + `.env.local` | Neon PostgreSQL connection string |
| `BLOB_READ_WRITE_TOKEN` | Vercel dashboard + `.env.local` | Vercel Blob access token |
| `SITE_PASSWORD` | Vercel dashboard + `.env.local` | Site password (`yumyum`) |

### 8.4 vercel.json
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 8.5 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/verify` | Verify site password against `SITE_PASSWORD` env var |
| GET | `/api/recipes` | All recipes with avg rating |
| POST | `/api/recipes` | Create recipe |
| GET | `/api/recipes/:id` | Recipe detail + per-user ratings |
| PUT | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe (admin) |
| POST | `/api/recipes/:id/image` | Upload photo to Vercel Blob |
| GET | `/api/recipes/og-image?url=` | Scrape og:image from URL |
| POST | `/api/ratings` | Upsert rating |
| GET | `/api/calendar?start=&end=` | Calendar entries for date range |
| POST | `/api/calendar` | Assign recipe to date |
| DELETE | `/api/calendar/:date` | Remove entry |

---

## 9. Deployment

1. Push repo to GitHub
2. Import project in Vercel dashboard — connect GitHub repo
3. Set environment variables: `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `SITE_PASSWORD`
4. Vercel auto-detects Vite (frontend) and `/api` directory (serverless functions)
5. Run the DB setup script once after first deploy to create tables and seed users
6. Subsequent pushes to `main` auto-deploy

---

## 10. Out of Scope (v1)

- User self-registration or account management
- Email notifications or reminders
- Breakfast/lunch meal planning
- Shopping list generation
- Recipe import from third-party services
- Dark mode

---

## 11. Success Criteria

- All four family members can log in and use the app from any device, anywhere
- Recipes can be added, browsed, searched, and rated in under 30 seconds
- A week of dinners can be planned in under 2 minutes
- Data persists across all devices via Neon DB
- Images upload reliably via Vercel Blob
