import { sql, setCors } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const users = await sql`SELECT * FROM users ORDER BY id`
  return res.status(200).json(users)
}
