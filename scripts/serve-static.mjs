import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('dist')
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json', '.xml': 'application/xml' }
const server = http.createServer(async (req, res) => {
  let pathname
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname) } catch { res.writeHead(400); res.end(); return }
  let filename = path.resolve(root, '.' + pathname)
  if (!filename.startsWith(root + path.sep) && filename !== root) { res.writeHead(403); res.end(); return }
  let status = 200
  try { if ((await fs.stat(filename)).isDirectory()) filename = path.join(filename, 'index.html'); await fs.access(filename) }
  catch { filename = path.join(root, '404.html'); status = 404 }
  try { const body = await fs.readFile(filename); res.writeHead(status, { 'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' }); res.end(req.method === 'HEAD' ? undefined : body) }
  catch { res.writeHead(503); res.end('Build required') }
})
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Static preview: http://127.0.0.1:${server.address().port}`))
