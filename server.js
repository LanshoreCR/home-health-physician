import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, sep } from 'node:path'

const ROOT = join(import.meta.dirname, 'dist')
const INDEX = join(ROOT, 'index.html')
const ASSETS = join(ROOT, 'assets') + sep
const PORT = process.env.PORT ?? 8080

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

const resolveFile = (url) => {
  const path = normalize(decodeURIComponent(url.split('?')[0]))
  const candidate = join(ROOT, path)
  if (!candidate.startsWith(ROOT + sep)) return INDEX
  if (!existsSync(candidate)) return INDEX
  if (!statSync(candidate).isFile()) return INDEX
  return candidate
}

createServer((req, res) => {
  const file = resolveFile(req.url ?? '/')
  res.writeHead(200, {
    'Content-Type': MIME[extname(file)] ?? 'application/octet-stream',
    'Cache-Control': file.startsWith(ASSETS)
      ? 'public, max-age=31536000, immutable'
      : 'no-cache',
  })
  createReadStream(file).pipe(res)
}).listen(PORT)
