import { sql, setCors, parseBody } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { id } = req.query

  if (req.method === 'GET') {
    const [recipe] = await sql`
      SELECT
        r.*,
        u.name AS added_by_name,
        ROUND(AVG(rt.stars)::numeric, 1)::float AS average_rating,
        COUNT(rt.id)::int AS rating_count
      FROM recipes r
      LEFT JOIN users u ON r.added_by_user_id = u.id
      LEFT JOIN ratings rt ON r.id = rt.recipe_id
      WHERE r.id = ${id}
      GROUP BY r.id, u.name
    `
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' })

    const per_user_ratings = await sql`
      SELECT u.id AS user_id, u.name AS user_name, rt.stars
      FROM users u
      LEFT JOIN ratings rt ON rt.user_id = u.id AND rt.recipe_id = ${id}
      ORDER BY u.id
    `

    const calendar_appearances = await sql`
      SELECT dinner_date
      FROM calendar_entries
      WHERE recipe_id = ${id}
      ORDER BY dinner_date DESC
      LIMIT 10
    `

    return res.status(200).json({ ...recipe, per_user_ratings, calendar_appearances })
  }

  if (req.method === 'PUT') {
    const { name, description, ingredients, instructions, link_url, image_url, blob_url } = await parseBody(req)

    const [recipe] = await sql`
      UPDATE recipes SET
        name         = COALESCE(${name ?? null}, name),
        description  = ${description ?? null},
        ingredients  = ${ingredients ?? null},
        instructions = ${instructions ?? null},
        link_url     = ${link_url ?? null},
        image_url    = ${image_url ?? null},
        blob_url     = ${blob_url ?? null},
        updated_at   = NOW()
      WHERE id = ${id}
      RETURNING *
    `
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' })
    return res.status(200).json(recipe)
  }

  if (req.method === 'DELETE') {
    const { user_id } = await parseBody(req)

    const [user] = await sql`SELECT role FROM users WHERE id = ${user_id}`
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only' })
    }

    await sql`DELETE FROM recipes WHERE id = ${id}`
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
