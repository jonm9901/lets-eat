import ogs from 'open-graph-scraper'
import { setCors } from '../_lib/db.js'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'url param is required' })

  try {
    const { result, error } = await ogs({ url, timeout: 5000 })
    if (error || !result.ogImage?.length) {
      return res.status(200).json({ og_image_url: null })
    }
    return res.status(200).json({ og_image_url: result.ogImage[0].url })
  } catch {
    return res.status(200).json({ og_image_url: null })
  }
}
