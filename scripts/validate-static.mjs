import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import path from 'node:path'

const pages = JSON.parse(await fs.readFile('src/data/pages.json', 'utf8'))
const routes = new Set(pages.map(p => p.path.replace(/\/$/, '') || '/'))
let links = 0
for (const page of pages) {
  const html = await fs.readFile(path.join('dist', page.path, 'index.html'), 'utf8')
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.path}: H1`)
  assert.match(html, /name="robots" content="noindex, nofollow"/, `${page.path}: noindex`)
  assert.match(html, /rel="canonical"/, `${page.path}: canonical`)
  assert.match(html, /application\/ld\+json/, `${page.path}: structured data`)
  assert.ok(!/<main[^>]*style="[^"]*opacity:0/.test(html), `${page.path}: invisible without JS`)
  for (const [, raw] of html.matchAll(/href="(\/[^"#?]*)/g)) {
    if (path.extname(raw)) continue
    const route = raw.replace(/\/$/, '') || '/'
    assert.ok(routes.has(route), `${page.path}: broken internal link ${route}`)
    links++
  }
}
const result = { routes: pages.length, checkedInternalLinks: links, htmlWithoutJavaScript: true, noindex: true, canonical: true, structuredData: true }
await fs.mkdir('reports', { recursive: true })
await fs.writeFile('reports/static-validation.json', JSON.stringify(result, null, 2))
console.log(result)
