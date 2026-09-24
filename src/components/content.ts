import pagesData from '../data/pages.json'

export type Block = {
  heading: string
  paragraphs: string[]
  bullets: string[]
}

export type Page = {
  slug: string
  path: string
  sourceUrl: string
  title: string
  seoTitle: string
  description: string
  type: string
  image: string
  images: string[]
  blocks: Block[]
  relatedSlugs?: string[]
  categorySlugs?: string[]
  categories?: string[]
  sourceRefs?: Array<string | { slug?: string; url?: string; href?: string }>
  author?: string | { name: string; slug?: string }
  publishedAt?: string
  datePublished?: string
  date?: string
  updatedAt?: string
  name?: string
  role?: string
  seniority?: string
  profile?: { name?: string; role?: string; bio?: string; image?: string }
}

export const pages = pagesData as Page[]
export const bySlug = new Map(pages.map(page => [page.slug, page]))
export const articles = pages.filter(page => page.type === 'artigo' && page.slug !== 'blog')
export const vacancies = pages.filter(page => page.type === 'vaga')

export function normalize(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function sectionId(heading: string, index: number) {
  return `${normalize(heading).replace(/[^a-z0-9]+/g, '-') || 'conteudo'}-${index + 1}`
}

export function href(slug: string) {
  return bySlug.get(slug)?.path || `/${slug.replaceAll('_', '/')}`
}

export function pageAt(path: string) {
  const pathname = path.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
  return pages.find(page => (page.path.replace(/\/+$/, '') || '/') === pathname)
    || (pathname === '/' ? bySlug.get('home') : undefined)
}

export function description(page: Page) {
  return page.description || page.blocks.flatMap(block => block.paragraphs)[0] || ''
}

export function profileName(page: Page) {
  return page.profile?.name || page.name || page.seoTitle.replace(/\s*[-|]\s*Antlia.*$/i, '').trim() || page.title
}

export function seniority(page: Page) {
  if (page.seniority) return page.seniority
  const title = normalize(page.title)
  if (/\b(senior|sr)\b/.test(title)) return 'Sênior'
  if (/\b(junior|jr)\b/.test(title)) return 'Júnior'
  if (/\b(pleno|pl)\b/.test(title)) return 'Pleno'
  return 'Não informada na fonte'
}

export function authorName(page: Page) {
  return typeof page.author === 'string' ? page.author : page.author?.name
}

export function publicationDate(page: Page) {
  return page.publishedAt || page.datePublished || page.date
}

export function formatDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(date)
}

function referencedSlugs(page: Page) {
  const slugs = new Set(page.relatedSlugs || [])
  for (const reference of page.sourceRefs || []) {
    const value = typeof reference === 'string' ? reference : reference.slug || reference.url || reference.href
    const target = pages.find(candidate => candidate.slug === value || candidate.path === value || candidate.sourceUrl === value)
    if (target) slugs.add(target.slug)
  }
  return slugs
}

export function categoryPages(category: Page) {
  const referenced = referencedSlugs(category)
  return pages.filter(candidate => candidate.slug !== category.slug && (
    referenced.has(candidate.slug)
    || candidate.categorySlugs?.includes(category.slug)
    || candidate.categories?.some(value => [category.slug, category.path, category.title].includes(value))
  ))
}

// Source relationships take precedence. Fallback recommendations require shared subject terms.
export function relatedPages(page: Page, types: string[]) {
  const explicit = referencedSlugs(page)
  const terms = new Set(normalize(page.title).split(/[^a-z0-9]+/).filter(term => term.length > 3 && !['para', 'como', 'antlia', 'seus', 'suas', 'sobre', 'empresa'].includes(term)))
  return pages.filter(candidate => candidate.slug !== page.slug && types.includes(candidate.type))
    .map(candidate => ({
      page: candidate,
      score: explicit.has(candidate.slug) ? 100 : normalize(candidate.title).split(/[^a-z0-9]+/).filter(term => terms.has(term)).length,
    }))
    .filter(candidate => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(candidate => candidate.page)
}
