import { sql, setCors, parseBody } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { recipe_id, user_id, stars } = await parseBody(req)
  if (!recipe_id || !user_id || !stars) {
    return res.status(400).json({ error: 'recipe_id, user_id, and stars are required' })
  }

  const [rating] = await sql`
    INSERT INTO ratings (recipe_id, user_id, stars)
    VALUES (${recipe_id}, ${user_id}, ${stars})
    ON CONFLICT (recipe_id, user_id)
    DO UPDATE SET stars = EXCLUDED.stars, rated_at = NOW()
    RETURNING *
  `
  return res.status(200).json(rating)
}
