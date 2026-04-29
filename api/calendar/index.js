import { sql, setCors, parseBody } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const { start, end } = req.query
    if (!start || !end) return res.status(400).json({ error: 'start and end params are required' })

    const entries = await sql`
      SELECT
        ce.id,
        ce.dinner_date,
        ce.recipe_id,
        ce.meal_type,
        ce.assigned_by_user_id,
        ce.assigned_at,
        r.name AS recipe_name,
        ROUND(AVG(rt.stars)::numeric, 1)::float AS average_rating,
        r.blob_url,
        r.image_url
      FROM calendar_entries ce
      LEFT JOIN recipes r ON ce.recipe_id = r.id
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
      WHERE ce.dinner_date BETWEEN ${start} AND ${end}
      GROUP BY ce.id, r.id
      ORDER BY ce.dinner_date ASC
    `
    return res.status(200).json(entries)
  }

  if (req.method === 'POST') {
    const { recipe_id, dinner_date, assigned_by_user_id, meal_type } = await parseBody(req)
    if (!dinner_date) return res.status(400).json({ error: 'dinner_date is required' })

    const [entry] = await sql`
      INSERT INTO calendar_entries (recipe_id, dinner_date, meal_type, assigned_by_user_id)
      VALUES (${recipe_id ?? null}, ${dinner_date}, ${meal_type ?? null}, ${assigned_by_user_id ?? null})
      ON CONFLICT (dinner_date)
      DO UPDATE SET
        recipe_id           = EXCLUDED.recipe_id,
        meal_type           = EXCLUDED.meal_type,
        assigned_by_user_id = EXCLUDED.assigned_by_user_id,
        assigned_at         = NOW()
      RETURNING *
    `
    return res.status(200).json(entry)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
