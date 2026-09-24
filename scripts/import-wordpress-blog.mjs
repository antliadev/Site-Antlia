import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const WP = 'https://antlia.com.br/wp-json/wp/v2/posts'
const output = path.resolve('src/data/wp-blog-pages.json')
const imageRoot = path.resolve('public/imported/blog')

const strip = (value = '') => value
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#8211;|&#x2013;|&ndash;/g, '-')
  .replace(/&#8212;|&#x2014;|&mdash;/g, '-')
  .replace(/&#8217;|&#x2019;|&rsquo;/g, "'")
  .replace(/&#8220;|&#x201C;|&ldquo;/g, '"')
  .replace(/&#8221;|&#x201D;|&rdquo;/g, '"')
  .replace(/&#8230;|&hellip;/g, '...')
  .replace(/&nbsp;| /g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/\s+/g, ' ')
  .trim()

const slugify = (value = '') => strip(value)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 90) || 'post'

function imageExtension(url, type = '') {
  const ext = new URL(url).pathname.match(/\.(png|jpe?g|webp|gif|svg)$/i)?.[1]
  if (ext) return ext.toLowerCase().replace('jpeg', 'jpg')
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  if (type.includes('gif')) return 'gif'
  if (type.includes('svg')) return 'svg'
  return 'jpg'
}

function usableImage(url = '') {
  return /^https?:\/\//.test(url)
    && !url.includes('secure.gravatar.com')
    && !url.includes('s.w.org/images/core/emoji')
    && !url.includes('/plugins/')
}

async function downloadImage(url, dir, nameHint) {
  if (!usableImage(url)) return ''
  await fs.mkdir(dir, { recursive: true })
  const response = await fetch(url)
  if (!response.ok) return ''
  const type = response.headers.get('content-type') || ''
  if (!type.startsWith('image/') && !/\.(png|jpe?g|webp|gif|svg)$/i.test(url)) return ''
  const ext = imageExtension(url, type)
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 8)
  const file = `${slugify(nameHint)}-${hash}.${ext}`
  const target = path.join(dir, file)
  const body = Buffer.from(await response.arrayBuffer())
  await fs.writeFile(target, body)
  return `/imported/blog/${path.basename(dir)}/${file}`
}

function mediaUrl(post) {
  const media = post._embedded?.['wp:featuredmedia']?.[0]
  if (!media) return ''
  return media.media_details?.sizes?.large?.source_url
    || media.media_details?.sizes?.medium_large?.source_url
    || media.source_url
    || ''
}

function extractImages(html = '') {
  return [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1])
    .filter(usableImage)
}

function htmlBlocks(html = '') {
  const prepared = html
    .replace(/<\/(p|h1|h2|h3|li|ul|ol|blockquote)>/gi, '</$1>\n')
    .replace(/<br\s*\/?>/gi, '\n')
  const tokens = prepared.match(/<(h1|h2|h3)[^>]*>[\s\S]*?<\/\1>|<p[^>]*>[\s\S]*?<\/p>|<li[^>]*>[\s\S]*?<\/li>/gi) || []
  const blocks = []
  let current

  const ensure = () => {
    if (!current) {
      current = { heading: 'Conteúdo', paragraphs: [], bullets: [] }
      blocks.push(current)
    }
    return current
  }

  for (const token of tokens) {
    const tag = token.match(/^<(\w+)/i)?.[1]?.toLowerCase()
    const text = strip(token)
    if (!text || text.length < 2) continue
    if (tag?.startsWith('h')) {
      current = { heading: text.slice(0, 140), paragraphs: [], bullets: [] }
      blocks.push(current)
      continue
    }
    if (tag === 'li') ensure().bullets.push(text)
    if (tag === 'p' && text.length > 12) ensure().paragraphs.push(text)
  }

  return blocks
    .map((block) => ({
      heading: block.heading,
      paragraphs: [...new Set(block.paragraphs)],
      bullets: [...new Set(block.bullets)],
    }))
    .filter((block) => block.paragraphs.length || block.bullets.length)
}

function parseWpJson(text, url) {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('[{"id"')
    if (start >= 0) return JSON.parse(text.slice(start))
    const objectStart = text.indexOf('{"id"')
    if (objectStart >= 0) return JSON.parse(text.slice(objectStart))
    throw new Error(`Resposta JSON inválida em ${url}`)
  }
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Falha ao buscar ${url}: ${response.status}`)
  return parseWpJson(await response.text(), url)
}

async function collectPosts() {
  const first = await fetch(`${WP}?per_page=100&page=1&_embed=1`)
  if (!first.ok) throw new Error(`Falha ao buscar posts: ${first.status}`)
  const totalPages = Number(first.headers.get('x-wp-totalpages') || 1)
  const posts = parseWpJson(await first.text(), `${WP}?per_page=100&page=1&_embed=1`)
  for (let page = 2; page <= totalPages; page += 1) {
    posts.push(...await fetchJson(`${WP}?per_page=100&page=${page}&_embed=1`))
  }
  return posts
}

const posts = await collectPosts()
const pages = []

for (const post of posts) {
  const title = strip(post.title?.rendered || '')
  const pageSlug = `arquivos_${post.id}`
  const dir = path.join(imageRoot, pageSlug)
  const rawImages = [mediaUrl(post), ...extractImages(post.content?.rendered || '')].filter(Boolean)
  const localImages = []
  for (const [index, url] of [...new Set(rawImages)].entries()) {
    const local = await downloadImage(url, dir, `${title}-${index + 1}`)
    if (local) localImages.push(local)
  }
  const blocks = htmlBlocks(post.content?.rendered || '')
  const description = strip(post.excerpt?.rendered || blocks.flatMap((b) => b.paragraphs)[0] || '')
  pages.push({
    slug: pageSlug,
    path: new URL(post.link).pathname.replace(/\/$/, ''),
    sourceUrl: post.link,
    title,
    seoTitle: title,
    description,
    type: 'artigo',
    image: localImages[0] || '',
    images: localImages.slice(0, 12),
    publishedAt: post.date,
    modifiedAt: post.modified,
    blocks,
  })
}

pages.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
await fs.mkdir(path.dirname(output), { recursive: true })
await fs.writeFile(output, JSON.stringify(pages, null, 2))
console.log(`Imported ${pages.length} WordPress posts and copied images to ${imageRoot}`)
