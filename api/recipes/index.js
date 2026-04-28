import { sql, setCors, parseBody } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    const { sort, user_id } = req.query
    const uid = parseInt(user_id) || 0

    let recipes
    if (sort === 'alpha') {
      recipes = await sql`
        SELECT r.*, u.name AS added_by_name,
          ROUND(AVG(rt.stars)::numeric, 1)::float AS average_rating,
          COUNT(rt.id)::int AS rating_count,
          ur.stars AS user_stars
        FROM recipes r
        LEFT JOIN users u ON r.added_by_user_id = u.id
        LEFT JOIN ratings rt ON r.id = rt.recipe_id
        LEFT JOIN ratings ur ON r.id = ur.recipe_id AND ur.user_id = ${uid}
        GROUP BY r.id, u.name, ur.stars
        ORDER BY r.name ASC
      `
    } else if (sort === 'top_rated') {
      recipes = await sql`
        SELECT r.*, u.name AS added_by_name,
          ROUND(AVG(rt.stars)::numeric, 1)::float AS average_rating,
          COUNT(rt.id)::int AS rating_count,
          ur.stars AS user_stars
        FROM recipes r
        LEFT JOIN users u ON r.added_by_user_id = u.id
        LEFT JOIN ratings rt ON r.id = rt.recipe_id
        LEFT JOIN ratings ur ON r.id = ur.recipe_id AND ur.user_id = ${uid}
        GROUP BY r.id, u.name, ur.stars
        ORDER BY average_rating DESC NULLS LAST
      `
    } else {
      recipes = await sql`
        SELECT r.*, u.name AS added_by_name,
          ROUND(AVG(rt.stars)::numeric, 1)::float AS average_rating,
          COUNT(rt.id)::int AS rating_count,
          ur.stars AS user_stars
        FROM recipes r
        LEFT JOIN users u ON r.added_by_user_id = u.id
        LEFT JOIN ratings rt ON r.id = rt.recipe_id
        LEFT JOIN ratings ur ON r.id = ur.recipe_id AND ur.user_id = ${uid}
        GROUP BY r.id, u.name, ur.stars
        ORDER BY r.created_at DESC
      `
    }

    return res.status(200).json(recipes)
  }

  if (req.method === 'POST') {
    const { name, description, ingredients, instructions, link_url, image_url, added_by_user_id } = await parseBody(req)
    if (!name) return res.status(400).json({ error: 'name is required' })

    const [recipe] = await sql`
      INSERT INTO recipes (name, description, ingredients, instructions, link_url, image_url, added_by_user_id)
      VALUES (${name}, ${description ?? null}, ${ingredients ?? null}, ${instructions ?? null}, ${link_url ?? null}, ${image_url ?? null}, ${added_by_user_id ?? null})
      RETURNING *
    `
    return res.status(201).json(recipe)
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
