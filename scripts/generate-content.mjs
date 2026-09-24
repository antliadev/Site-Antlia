import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.cwd(), '..')
const docsDir = path.join(root, 'docs')
const output = path.join(process.cwd(), 'src/data/pages.json')
const importedBlog = path.join(process.cwd(), 'src/data/wp-blog-pages.json')

const noise = [
  'Gerenciar o consentimento', 'Pular para o conteudo', 'Pular para o conteúdo',
  'Assine nossa Newsletter', 'Contato e Redes Sociais', 'Dados Estruturados',
  'Ola! Preencha os campos', 'Olá! Preencha os campos', 'Antlia - Todos os direitos',
  'Ative o JavaScript', 'Campo obrigatorio', 'Campo obrigatório', 'E-mail invalido',
  'E-mail inválido', 'Leia mais »', 'Nenhum comentario', 'Nenhum comentário',
  'elementor-action', 'Solicitar Contato', 'Carregando', 'EM Desenvolvimento',
]
const stopHeadings = new Set(['Antlia', 'Solucoes', 'Soluções', 'Compartilhe', 'Deixe um comentario', 'Deixe um comentário', 'Artigos relacionados'])

const titleOverrides = {
  home: 'Tecnologia para operações que não podem parar',
  blog: 'Insights Antlia',
  'esg-antlia': 'ESG Antlia',
}

const cleanInline = (value) => value
  .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/\[\]\([^)]*\)/g, '')
  .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  .replace(/([^[]+)\]\(https?:\/\/[^)]+\)/g, '$1')
  .replace(/<https?:\/\/[^>]+>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/`{1,3}/g, '')
  .replace(/\*\*/g, '')
  .replace(/[_~]{2,}/g, '')
  .replace(/&nbsp;| /g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"')
  .replace(/\\_/g, '_')
  .replace(/\s+/g, ' ')
  .trim()

const invalidText = (text) => !text
  || noise.some((n) => text.includes(n))
  || /^(https?:|www\.)/i.test(text)
  || /\]\(https?:\/\//i.test(text)
  || /^\|?\s*:?-{3,}/.test(text)
  || (text.split('|').length > 3)
  || /<(script|style|svg|xml|iframe)/i.test(text)
  || /(?:@type|schema\.org|wp-content|elementor)/i.test(text)

function classify(slug) {
  if (slug === 'home') return 'home'
  if (slug === 'blog' || slug.startsWith('arquivos_')) return slug.startsWith('arquivos_vagas_') ? 'vaga' : slug.startsWith('arquivos_category_') ? 'categoria' : 'artigo'
  if (slug.startsWith('categorias_') || slug === 'category') return 'categoria'
  if (slug.startsWith('solucoes-antlia_')) return 'solucao'
  if (['desenvolvimento-de-software','outsourcing-ti','quality-assurance','atendimento-help-desk','alocacao-de-programadores','nossas-solucoes','solucoes-antlia'].includes(slug)) return 'servico'
  if (['edimarcos-paula','leandro-reis','lucas-vitoretti','marcio-papke','pedro-vitoretti'].includes(slug)) return 'perfil'
  if (slug.startsWith('politica-')) return 'politica'
  if (slug.startsWith('confirmacao')) return 'confirmacao'
  if (['contato','trabalhe-conosco','admissao-clt','cadastro-fornecedor','cadastro-fornecedor-empresa-rascunho'].includes(slug)) return 'formulario'
  return 'institucional'
}

function extract(file) {
  const source = fs.readFileSync(path.join(docsDir, file), 'utf8')
  const front = source.match(/^---\n([\s\S]*?)\n---/m)?.[1] || ''
  const meta = Object.fromEntries([...front.matchAll(/^(\w+):\s*"?([^"\n]+)"?$/gm)].map((m) => [m[1], m[2]]))
  const slug = file.replace(/\.md$/, '')
  const lines = source.split('\n')
  const headingIndexes = lines.map((line, i) => /^#{1,3}\s+/.test(line) ? i : -1).filter((i) => i >= 0)
  const contentStart = headingIndexes.find((i) => i > 40) ?? headingIndexes.at(-1) ?? 0
  const section = lines.slice(contentStart)
  const blocks = []
  const images = []
  let current = null

  for (const raw of section) {
    const image = raw.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/)
    if (image && !image[1].includes('Logo-Antlia') && !image[1].includes('cropped-logo') && !image[1].includes('plugin')) images.push(image[1].split(' "')[0])
    const h = raw.match(/^(#{1,3})\s+(.+)/)
    if (h) {
      const title = cleanInline(h[2])
      if (noise.some((n) => title.includes(n)) || stopHeadings.has(title)) break
      if (title && title.length < 150) {
        current = { heading: title, paragraphs: [], bullets: [] }
        blocks.push(current)
      }
      continue
    }
    if (!current || /^#{4,6}\s+/.test(raw)) continue
    const text = cleanInline(raw.replace(/^[-*]\s+/, ''))
    if (invalidText(text)) continue
    if (raw.match(/^[-*]\s+/)) current.bullets.push(text)
    else if (text.length > 24 && text.length < 900) current.paragraphs.push(text)
  }

  const seen = new Set()
  const deduped = blocks.filter((block) => {
    block.paragraphs = [...new Set(block.paragraphs)].slice(0, 8)
    block.bullets = [...new Set(block.bullets)].slice(0, 12)
    if (!block.paragraphs.length && !block.bullets.length) return false
    if (seen.has(block.heading)) return false
    seen.add(block.heading)
    return true
  })
  const extractedTitle = cleanInline(deduped[0]?.heading || '')
  const metaTitle = cleanInline(meta.h1 || '')
  const title = titleOverrides[slug] || (metaTitle && !noise.some((n) => metaTitle.includes(n)) ? metaTitle : extractedTitle) || cleanInline(meta.title || slug.replaceAll('-', ' '))
  return {
    slug,
    path: slug === 'home' ? '/' : '/' + slug.replaceAll('_', '/'),
    sourceUrl: meta.url || '',
    title,
    seoTitle: cleanInline(meta.title || title),
    description: cleanInline(meta.description || deduped.flatMap((b) => b.paragraphs)[0] || ''),
    type: classify(slug),
    image: [...new Set(images)][0] || '',
    images: [...new Set(images)].slice(0, 6),
    blocks: deduped.slice(0, 18),
  }
}

if (!fs.existsSync(docsDir)) {
  if (fs.existsSync(output)) {
    console.log(`Using existing ${output} (docs directory not present).`)
    process.exit(0)
  }
  console.error(`Error: Neither ${docsDir} nor ${output} found.`)
  process.exit(1)
}

let pages = fs.readdirSync(docsDir)
  .filter((file) => file.endsWith('.md') && file !== 'indice.md' && !file.includes('loaderio'))
  .map(extract)
  .filter((page) => page.title && !page.title.includes('Sem Titulo') && !page.title.includes('Sem Título'))

if (fs.existsSync(importedBlog)) {
  const posts = JSON.parse(fs.readFileSync(importedBlog, 'utf8'))
  const importedSlugs = new Set(posts.map((post) => post.slug))
  pages = [
    ...pages.filter((page) => page.type !== 'artigo' || page.slug === 'blog' || !page.slug.startsWith('arquivos_') || !importedSlugs.has(page.slug)),
    ...posts,
  ]
}

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, JSON.stringify(pages, null, 2))
console.log(`Generated ${pages.length} pages in ${output}`)
