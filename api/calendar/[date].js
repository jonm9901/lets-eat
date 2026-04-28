import { sql, setCors } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' })

  const { date } = req.query

  await sql`DELETE FROM calendar_entries WHERE dinner_date = ${date}`
  return res.status(200).json({ success: true })
}
