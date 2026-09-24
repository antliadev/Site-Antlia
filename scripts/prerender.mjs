import fs from 'node:fs/promises'
import path from 'node:path'
import { createServer } from 'vite'

const pages = JSON.parse(await fs.readFile('src/data/pages.json', 'utf8'))
const template = await fs.readFile('dist/index.html', 'utf8')
const escape = (value = '') => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const json = value => JSON.stringify(value).replace(/</g, '\\u003c')
const origin = 'https://antlia.com.br'
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
  for (const page of [...pages, { path: '/404', title: 'Pagina nao encontrada', type: '404' }]) {
    const canonical = origin + page.path
    const description = page.description || `Conheca ${page.title} na Antlia.`
    const graph = [{ '@type': 'Organization', '@id': origin + '/#organization', name: 'Antlia', url: origin },
      { '@type': 'WebPage', '@id': canonical, url: canonical, name: page.title, description, inLanguage: 'pt-BR' },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Antlia', item: origin }, ...(page.path === '/' ? [] : [{ '@type': 'ListItem', position: 2, name: page.title, item: canonical }])] }]
    if (['servico', 'solucao'].includes(page.type)) graph.push({ '@type': 'Service', name: page.title, description, url: canonical, provider: { '@id': origin + '/#organization' } })
    if (page.type === 'artigo' && page.slug !== 'blog') graph.push({ '@type': 'Article', headline: page.title, description, mainEntityOfPage: canonical, ...(page.publishedAt ? { datePublished: page.publishedAt } : {}), ...(page.author ? { author: { '@type': 'Person', name: page.author } } : {}) })
    const head = `<title>${escape(page.title)} | Antlia</title><meta name="description" content="${escape(description)}"><link rel="canonical" href="${escape(canonical)}"><script type="application/ld+json">${json({ '@context': 'https://schema.org', '@graph': graph })}</script>`
    const html = template.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta\s+name="description"[\s\S]*?\/>/, '').replace('</head>', head + '</head>').replace('<div id="root"></div>', `<div id="root">${render(page.path)}</div>`)
    const target = page.type === '404' ? 'dist/404.html' : path.join('dist', page.path, 'index.html')
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, html)
  }
  await fs.writeFile('dist/robots.txt', 'User-agent: *\nDisallow: /\n')
  // Preview pages are all noindex. Production sitemap requires editorial approval.
  await fs.writeFile('dist/sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>')
  console.log(`Pre-rendered ${pages.length} routes plus 404. Preview: noindex.`)
} finally { await vite.close() }
