import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL)

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export function parseBody(req) {
  // vercel dev pre-parses the body onto req.body
  if (req.body !== undefined) {
    const b = req.body
    return Promise.resolve(typeof b === 'string' ? JSON.parse(b) : b)
  }
  // production: read raw stream
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => { data += chunk })
    req.on('end', () => {
      try { resolve(JSON.parse(data)) } catch { resolve({}) }
    })
  })
}
