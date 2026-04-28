import multiparty from 'multiparty'
import { put } from '@vercel/blob'
import { sql, setCors } from '../../_lib/db.js'
import fs from 'fs'

export default async function handler(req, res) {
  setCors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query

  const form = new multiparty.Form()

  form.parse(req, async (err, _fields, files) => {
    if (err) return res.status(400).json({ error: 'Failed to parse upload' })

    const file = files?.file?.[0]
    if (!file) return res.status(400).json({ error: 'No file provided' })

    try {
      const fileBuffer = fs.readFileSync(file.path)
      const filename = `recipes/${id}-${Date.now()}-${file.originalFilename}`

      const blob = await put(filename, fileBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.headers['content-type'],
      })

      await sql`UPDATE recipes SET blob_url = ${blob.url}, updated_at = NOW() WHERE id = ${id}`

      return res.status(200).json({ blob_url: blob.url })
    } catch (uploadErr) {
      console.error('Blob upload error:', uploadErr)
      return res.status(500).json({ error: 'Upload failed' })
    }
  })
}
