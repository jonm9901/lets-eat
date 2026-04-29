import { setCors } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { q } = req.query
  if (!q) return res.status(400).json({ error: 'q param is required' })

  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: process.env.PEXELS_API_KEY } }
    )
    const data = await response.json()
    const photo = data.photos?.[0]
    if (!photo) return res.status(200).json({ image_url: null })
    return res.status(200).json({ image_url: photo.src.large })
  } catch {
    return res.status(200).json({ image_url: null })
  }
}
