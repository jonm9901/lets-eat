import { setCors, parseBody } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { password } = await parseBody(req)
  if (password === process.env.SITE_PASSWORD) {
    return res.status(200).json({ success: true })
  }
  return res.status(200).json({ success: false })
}
