import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

async function setupDatabase() {
  console.log('Setting up database...')

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id           SERIAL PRIMARY KEY,
      name         TEXT NOT NULL,
      role         TEXT NOT NULL DEFAULT 'member',
      avatar_color TEXT NOT NULL
    )
  `
  console.log('✓ users table')

  await sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id               SERIAL PRIMARY KEY,
      name             TEXT NOT NULL,
      description      TEXT,
      ingredients      TEXT,
      instructions     TEXT,
      link_url         TEXT,
      blob_url         TEXT,
      image_url        TEXT,
      added_by_user_id INTEGER REFERENCES users(id),
      created_at       TIMESTAMPTZ DEFAULT NOW(),
      updated_at       TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS instructions TEXT`
  console.log('✓ recipes table')

  await sql`
    CREATE TABLE IF NOT EXISTS ratings (
      id        SERIAL PRIMARY KEY,
      recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
      user_id   INTEGER REFERENCES users(id),
      stars     INTEGER CHECK (stars BETWEEN 1 AND 5),
      rated_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(recipe_id, user_id)
    )
  `
  console.log('✓ ratings table')

  await sql`
    CREATE TABLE IF NOT EXISTS calendar_entries (
      id                  SERIAL PRIMARY KEY,
      recipe_id           INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
      dinner_date         DATE NOT NULL UNIQUE,
      assigned_by_user_id INTEGER REFERENCES users(id),
      assigned_at         TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('✓ calendar_entries table')

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM users`
  if (count === 0) {
    await sql`
      INSERT INTO users (name, role, avatar_color) VALUES
        ('Jon',   'admin',  '#C0392B'),
        ('Wendy', 'member', '#8E44AD'),
        ('Noah',  'member', '#2980B9'),
        ('Kaden', 'member', '#27AE60')
    `
    console.log('✓ Seeded 4 users')
  } else {
    console.log(`✓ Users already seeded (${count} found)`)
  }

  console.log('\nDatabase setup complete!')
}

setupDatabase().catch((err) => {
  console.error('Setup failed:', err.message)
  process.exit(1)
})
