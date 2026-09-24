import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  FileCheck2,
  Headphones,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react'
import pagesData from './data/pages.json'
import './App.css'

type Block = { heading: string; paragraphs: string[]; bullets: string[] }
type Page = {
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
}

const pages = pagesData as Page[]
const bySlug = new Map(pages.map((p) => [p.slug, p]))

const services = [
  ['desenvolvimento-de-software', '01', Code2, 'Produtos digitais, plataformas escaláveis e modernização de arquiteturas legadas.'],
  ['outsourcing-ti', '02', UsersRound, 'Squads dedicados e multidisciplinares integrados à cultura e aos objetivos do seu negócio.'],
  ['quality-assurance', '03', FileCheck2, 'Engenharia de testes, automação contínua e garantia rigorosa de qualidade no ciclo de entrega.'],
  ['atendimento-help-desk', '04', Headphones, 'Sustentação N1, N2 e N3 com SLAs críticos para manter sua operação 100% ativa.'],
  ['alocacao-de-programadores', '05', BriefcaseBusiness, 'Especialistas seniores prontos para acelerar desafios estratégicos de tecnologia.'],
] as const

const groups = [
  [
    'Build',
    'Produtos & Engenharia',
    [
      'desenvolvimento-angular',
      'desenvolvimento-de-aplicativos',
      'desenvolvimento-backend',
      'desenvolvimento-cobol',
      'desenvolvimento-crm',
      'desenvolvimento-de-erp',
      'desenvolvimento-de-sistemas',
      'desenvolvimento-java',
      'desenvolvimento-net',
      'desenvolvimento-php',
    ],
  ],
  [
    'Scale',
    'Squads & Especialistas',
    [
      'alocacao-de-desenvolvedor-aplicativos',
      'alocacao-de-desenvolvedor-backend',
      'alocacao-de-desenvolvedor-frontend',
      'alocacao-de-desenvolvedor-java',
      'alocacao-de-desenvolvedores',
      'alocacao-desenvolvedor-net',
      'body-shop-desenvolvedores',
      'outsourcing-de-equipe-ti',
      'staff-augmentation',
    ],
  ],
  [
    'Assure',
    'Qualidade & Operação',
    [
      'atendimento-help-desk',
      'chamados-de-ti',
      'documentacao-de-sistema',
      'microsoft-partner',
      'processos-de-help-desk',
      'quality-assurance',
      'suporte-angular',
      'suporte-c-e-net',
      'suporte-java',
    ],
  ],
] as const

const labels: Record<string, string> = {
  solucao: 'SOLUÇÃO ANTLIA',
  servico: 'CAPACIDADE',
  artigo: 'INSIGHT',
  vaga: 'CARREIRA',
  perfil: 'LIDERANÇA',
  categoria: 'TEMA',
  politica: 'POLÍTICA',
  formulario: 'JORNADA',
  confirmacao: 'CONFIRMAÇÃO',
  institucional: 'INSTITUCIONAL',
}

const label = (t: string) => labels[t] || 'ANTLIA'
const id = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')

const desc = (p: Page) =>
  p.description && p.description.length < 260
    ? p.description
    : p.blocks.flatMap((b) => b.paragraphs)[0] || 'Conteúdo institucional Antlia.'

function route(path: string) {
  const x = path.replace(/^\/+|\/+$/g, '')
  if (!x) return 'home'
  const direct = x.replaceAll('/', '_')
  return bySlug.has(direct) ? direct : x.split('/').at(-1) || direct
}

function navigate(slug: string) {
  if (typeof window === 'undefined') return
  const p = bySlug.get(slug)
  window.history.pushState({}, '', p?.path || '/' + slug.replaceAll('_', '/'))
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <button className="brand" onClick={() => navigate('home')} aria-label="Ir para a página inicial da Antlia">
      <img
        src={light ? '/brand/logo-antlia-branca.svg' : '/brand/logo-antlia-azul.svg'}
        alt="Antlia Consultoria e Tecnologia"
        width="160"
        height="40"
      />
    </button>
  )
}

export default function App({ initialPath }: { initialPath?: string } = {}) {
  const [slug, setSlug] = useState(() => {
    if (initialPath) return route(initialPath)
    if (typeof location !== 'undefined') return route(location.pathname)
    return 'home'
  })
  const [menu, setMenu] = useState(false)
  const [mega, setMega] = useState(false)
  const [search, setSearch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const update = () => {
      setSlug(route(location.pathname))
      setMenu(false)
      setMega(false)
    }
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  const page = bySlug.get(slug)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = page?.seoTitle || 'Antlia | Consultoria e Tecnologia'
    }
  }, [page])

  return (
    <div className="app-shell">
      <Header
        menu={menu}
        mega={mega}
        setMenu={setMenu}
        setMega={setMega}
        openSearch={() => setSearch(true)}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={slug}
          className="main-content"
          initial={typeof window !== 'undefined' ? { opacity: 0, y: 6 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
        >
          {page ? <Router page={page} /> : <NotFound />}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <AnimatePresence>{search && <SearchPanel close={() => setSearch(false)} />}</AnimatePresence>
    </div>
  )
}

function Header({
  menu,
  mega,
  setMenu,
  setMega,
  openSearch,
}: {
  menu: boolean
  mega: boolean
  setMenu: (v: boolean) => void
  setMega: (v: boolean) => void
  openSearch: () => void
}) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className={menu ? 'nav open' : 'nav'} aria-label="Navegação Principal">
          <button className="nav-link" onClick={() => navigate('home')}>
            Empresa
          </button>
          <button className="nav-link" onClick={() => setMega(!mega)} aria-expanded={mega}>
            Capacidades <ChevronDown size={14} />
          </button>
          <button className="nav-link" onClick={() => navigate('blog')}>
            Insights
          </button>
          <button className="nav-link" onClick={() => navigate('esg-antlia')}>
            ESG
          </button>
          <button className="nav-link" onClick={() => navigate('trabalhe-conosco')}>
            Carreiras
          </button>
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={openSearch} aria-label="Abrir busca global">
            <Search size={18} />
          </button>
          <button className="contact-button" onClick={() => navigate('contato')}>
            Falar com especialista <ArrowUpRight size={16} />
          </button>
          <button
            className="icon-button menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {mega && <Mega close={() => setMega(false)} />}
    </header>
  )
}

function Mega({ close }: { close: () => void }) {
  return (
    <motion.div
      className="mega"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
    >
      <div className="mega-intro">
        <span className="eyebrow light">ECOSSISTEMA TÉCNICO</span>
        <h2>Da arquitetura estratégica à sustentação contínua.</h2>
        <button
          onClick={() => {
            navigate('nossas-solucoes')
            close()
          }}
        >
          Explorar catálogo de soluções <ArrowRight size={16} />
        </button>
      </div>
      <div className="mega-grid">
        {services.map(([slug, n, Icon]) => (
          <button
            key={slug}
            className="mega-card"
            onClick={() => {
              navigate(slug)
              close()
            }}
          >
            <span>{n}</span>
            <Icon size={22} />
            <strong>{bySlug.get(slug)?.title}</strong>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

function Router({ page }: { page: Page }) {
  if (page.type === 'home') return <Home />
  if (page.slug === 'blog') return <Blog />
  if (['nossas-solucoes', 'solucoes-antlia'].includes(page.slug)) return <Solutions />
  if (['servico', 'solucao'].includes(page.type)) return <Commercial page={page} />
  if (['artigo', 'categoria'].includes(page.type)) return <Editorial page={page} />
  if (page.type === 'vaga') return <Job page={page} />
  if (page.type === 'perfil') return <Profile page={page} />
  if (page.type === 'politica') return <Policy page={page} />
  if (['formulario', 'confirmacao'].includes(page.type)) return <Journey page={page} />
  return <Institutional page={page} />
}

function Home() {
  const latest = pages
    .filter((p) => p.type === 'artigo' && p.image && p.title.length < 100)
    .slice(-6)
    .reverse()

  return (
    <>
      {/* CAPÍTULO 1: HERO CINEMATOGRÁFICO */}
      <section className="home-hero">
        <HeroMedia page={bySlug.get('home')} />
        <div className="hero-overlay" />
        <div className="home-hero-inner">
          <Kicker text="ENGENHARIA DE MISSÃO CRÍTICA" />
          <h1>
            Engenharia digital para operações que <em>não podem parar.</em>
          </h1>
          <p>
            Desenvolvimento de software de alta complexidade, squads especializados, garantia de qualidade e sustentação
            para transformar tecnologia crítica em capacidade contínua de negócio.
          </p>
          <div className="hero-actions">
            <button className="button signal" onClick={() => navigate('contato')}>
              Falar com um especialista <ArrowUpRight size={17} />
            </button>
            <button className="button ghost" onClick={() => navigate('nossas-solucoes')}>
              Explorar ecossistema
            </button>
          </div>
        </div>
        <div className="hero-proof">
          <span>DESDE 2006</span>
          <strong>Engenharia de Software</strong>
          <strong>Squads Multidisciplinares</strong>
          <strong>Disponibilidade Contínua</strong>
        </div>
      </section>

      {/* CAPÍTULO 2: MANIFESTO / POSICIONAMENTO */}
      <section className="statement section">
        <span className="section-label">01 / PROPÓSITO & ATUAÇÃO</span>
        <div>
          <h2>Tecnologia com clareza de negócio e responsabilidade de operação.</h2>
          <p>
            A Antlia conecta estratégia corporativa, engenharia de software rigorosa e pessoas de alto desempenho para
            criar produtos digitais modernos, modernizar sistemas legados e sustentar ambientes onde cada segundo conta.
          </p>
        </div>
      </section>

      {/* CAPÍTULO 3: CAPACIDADES EM FORMATO EDITORIAL */}
      <section className="capabilities">
        <div className="capabilities-head">
          <span className="section-label">02 / CAPACIDADES</span>
          <h2>
            Uma estrutura completa.
            <br />
            Um único parceiro de tecnologia.
          </h2>
        </div>
        <div className="capability-list">
          {services.map(([slug, n, Icon, d]) => (
            <button className="capability-row" key={slug} onClick={() => navigate(slug)}>
              <span>{n}</span>
              <div className="capability-row-icon">
                <Icon size={22} />
              </div>
              <div>
                <h3>{bySlug.get(slug)?.title}</h3>
                <p>{d}</p>
              </div>
              <ArrowUpRight className="capability-row-arrow" size={20} />
            </button>
          ))}
        </div>
      </section>

      {/* CAPÍTULO 4: MODELO OPERACIONAL NO ESCURO */}
      <section className="operating-model section">
        <div>
          <span className="section-label inverse">03 / METODOLOGIA</span>
          <h2>
            Construir.
            <br />
            Evoluir.
            <br />
            <em>Sustentar.</em>
          </h2>
          <p className="subtext">
            Do diagnóstico de arquitetura à sustentação 24/7, nossas equipes trabalham integradas à realidade operacional de cada cliente.
          </p>
        </div>
        <div className="operating-steps">
          {[
            {
              step: '01',
              title: 'Diagnóstico & Arquitetura',
              desc: 'Entendimento detalhado do cenário corporativo, desenho técnico e plano executivo de entrega.',
            },
            {
              step: '02',
              title: 'Engenharia Incremental',
              desc: 'Ciclos curtos e ágeis com qualidade incorporada desde a primeira linha de código.',
            },
            {
              step: '03',
              title: 'Validação & Segurança',
              desc: 'Garantia de qualidade, testes automatizados e conformidade com padrões corporativos.',
            },
            {
              step: '04',
              title: 'Sustentação & Evolução',
              desc: 'Operação ininterrupta, monitoramento proativo de incidentes e melhoria permanente.',
            },
          ].map((item) => (
            <div className="operating-step" key={item.step}>
              <span>{item.step}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CAPÍTULO 5: BENTO GRID DE AUTORIDADE E INDICADORES */}
      <section className="bento-section">
        <SectionTitle
          eyebrow="04 / AUTORIDADE & EVIDÊNCIAS"
          title="Solidez comprovada em operações corporativas complexas."
        />
        <div className="bento-grid">
          <div className="bento-card col-8 dark-theme">
            <span className="bento-tag">MISSÃO CRÍTICA</span>
            <div>
              <h3>Disponibilidade e continuidade para ambientes que sustentam negócios.</h3>
              <p>
                Desenvolvemos e operamos plataformas transacionais onde estabilidade é premissa mandatória. Nossos squads
                aplicam práticas de resiliência e alta performance em cada entrega.
              </p>
            </div>
            <div className="bento-metric">+18 anos</div>
          </div>
          <div className="bento-card col-4">
            <span className="bento-tag">PARCERIA ESTRATÉGICA</span>
            <h3>Microsoft Partner</h3>
            <p>
              Capacidade técnica atestada para projetos de nuvem, modernização de aplicações e ecossistemas corporativos.
            </p>
          </div>
          <div className="bento-card col-4">
            <span className="bento-tag">TALENTOS & SQUADS</span>
            <h3>Capacidade Dedicada</h3>
            <p>
              Profissionais sêniores em Java, .NET, Angular, Cloud e QA integrados com agilidade à sua operação.
            </p>
          </div>
          <div className="bento-card col-8">
            <span className="bento-tag">GOVERNANÇA & ESG</span>
            <div>
              <h3>Compromisso ativo com responsabilidade, transparência e segurança.</h3>
              <p>
                Práticas de integridade ética, responsabilidade socioambiental corporativa e conformidade rigorosa com a
                Lei Geral de Proteção de Dados (LGPD).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAPÍTULO 6: INSIGHTS & INTELIGÊNCIA */}
      <section className="insights section">
        <SectionTitle
          eyebrow="05 / INTELIGÊNCIA APLICADA"
          title="Perspectivas e artigos para decisões técnicas mais seguras."
          action="Ver todas as publicações"
          onAction={() => navigate('blog')}
        />
        <div className="editorial-grid">
          {latest.slice(0, 3).map((a, i) => (
            <Card key={a.slug} page={a} featured={i === 0} />
          ))}
        </div>
      </section>

      {/* CAPÍTULO 7: CTA PRINCIPAL */}
      <CTA />
    </>
  )
}

function Solutions() {
  return (
    <>
      <PageHero
        page={bySlug.get('nossas-solucoes')}
        tag="ECOSSISTEMA ANTLIA"
        title="Capacidades conectadas para todo o ciclo de tecnologia."
        description="Da concepção arquitetural à sustentação diária, combine engenharia, especialistas e qualidade de acordo com o momento da sua empresa."
      />
      <section className="solution-catalog section">
        {groups.map(([verb, group, slugs], i) => (
          <div className="solution-group" key={group}>
            <div className="group-title">
              <span>0{i + 1}</span>
              <small>{verb}</small>
              <h2>{group}</h2>
            </div>
            <div className="solution-links">
              {slugs.map((s) => {
                const p = bySlug.get('solucoes-antlia_' + s) || bySlug.get(s)
                return (
                  p && (
                    <button key={p.slug} onClick={() => navigate(p.slug)}>
                      <span>{p.title}</span>
                      <ArrowUpRight size={16} />
                    </button>
                  )
                )
              })}
            </div>
          </div>
        ))}
      </section>
      <CTA />
    </>
  )
}

function Blog() {
  const articles = pages
    .filter((p) => p.type === 'artigo' && p.slug !== 'blog' && !/newsletter/i.test(p.title))
    .reverse()
  const cats = pages.filter((p) => p.type === 'categoria').slice(0, 10)

  return (
    <>
      <PageHero
        page={bySlug.get('blog')}
        tag="ANTLIA INSIGHTS"
        title="Conhecimento para decisões tecnológicas conscientes."
        description="Engenharia, gestão de produto, talentos e tendências de tecnologia explicadas por quem vive a operação na prática."
      />
      <section className="blog-toolbar section">
        <div className="chips">
          {cats.map((c) => (
            <button key={c.slug} onClick={() => navigate(c.slug)}>
              {c.title.replace('Arquivos ', '')}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {articles.length} publicações disponíveis
        </span>
      </section>
      <section className="article-list section">
        {articles.slice(0, 30).map((a, i) => (
          <Card key={a.slug} page={a} featured={i === 0} />
        ))}
      </section>
    </>
  )
}

function Commercial({ page }: { page: Page }) {
  const blocks = page.blocks.slice(0, 7)
  const related = pages.filter((p) => p.type === page.type && p.slug !== page.slug).slice(0, 4)

  return (
    <>
      <PageHero page={page} tag={label(page.type)} description={desc(page)} action="Planejar uma conversa técnica" />
      <section className="commercial-intro section">
        <div>
          <span className="section-label">VISÃO DIRETA</span>
          <h2>
            {page.type === 'servico'
              ? 'Capacidade técnica conectada ao resultado esperado.'
              : 'Especialização para o seu desafio específico.'}
          </h2>
        </div>
        <p>{blocks[0]?.paragraphs[0] || desc(page)}</p>
      </section>
      <section className="delivery-grid section">
        {blocks.slice(1, 5).map((b, i) => (
          <article className="delivery-card" key={b.heading}>
            <span>0{i + 1}</span>
            <h2>{b.heading}</h2>
            {b.paragraphs.slice(0, 2).map((p) => (
              <p key={p}>{p}</p>
            ))}
            {b.bullets.length > 0 && (
              <ul>
                {b.bullets.slice(0, 5).map((x) => (
                  <li key={x}>
                    <Check size={16} />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
      <Process />
      <section className="related section" style={{ background: 'var(--bg-subtle)' }}>
        <SectionTitle eyebrow="CONTINUE EXPLORANDO" title="Capacidades e soluções relacionadas." />
        <div className="editorial-grid">
          {related.slice(0, 3).map((p) => (
            <Card key={p.slug} page={p} />
          ))}
        </div>
      </section>
      <CTA />
    </>
  )
}

function Institutional({ page }: { page: Page }) {
  const esg = page.slug === 'esg-antlia'

  return (
    <>
      <PageHero page={page} tag={esg ? 'AMBIENTAL · SOCIAL · GOVERNANÇA' : label(page.type)} description={desc(page)} />
      {esg && (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            padding: '48px max(24px, calc((100vw - 1280px)/2))',
            background: 'var(--bg-subtle)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {[
            ['E', 'Ambiental', 'Tecnologia eficiente e práticas de operação conscientes com o meio ambiente.'],
            ['S', 'Social', 'Desenvolvimento de pessoas, diversidade, inclusão e estímulo contínuo ao aprendizado.'],
            ['G', 'Governança', 'Ética corporativa, conformidade com a LGPD e absoluta transparência nas relações.'],
          ].map((x) => (
            <div
              key={x[0]}
              style={{
                padding: '36px',
                background: 'var(--bg-canvas)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <b style={{ fontFamily: 'var(--font-display)', fontSize: '56px', color: 'var(--antlia-blue)', lineHeight: 1 }}>
                {x[0]}
              </b>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '16px 0 8px' }}>{x[1]}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>{x[2]}</p>
            </div>
          ))}
        </section>
      )}
      <Structured page={page} />
      <CTA />
    </>
  )
}

function Editorial({ page }: { page: Page }) {
  const related = pages.filter((p) => p.type === 'artigo' && p.slug !== page.slug).slice(0, 3)

  return (
    <>
      <PageHero page={page} tag={label(page.type)} description={desc(page)} />
      <section className="article-shell section">
        <aside>
          <span>LEITURA</span>
          <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
            {Math.max(3, Math.ceil(page.blocks.flatMap((b) => b.paragraphs).join(' ').split(' ').length / 210))} min
          </strong>
          <i />
        </aside>
        <div>
          <div className="answer-box">
            <span>EM RESUMO</span>
            <p>{page.blocks.flatMap((b) => b.paragraphs)[0] || desc(page)}</p>
          </div>
          <Rich page={page} />
        </div>
      </section>
      {related.length > 0 && (
        <section className="related section" style={{ background: 'var(--bg-subtle)' }}>
          <SectionTitle eyebrow="LEIA TAMBÉM" title="Outras perspectivas e insights." />
          <div className="editorial-grid">
            {related.map((p) => (
              <Card key={p.slug} page={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function Job({ page }: { page: Page }) {
  return (
    <>
      <PageHero page={page} tag="CARREIRAS ANTLIA" description={desc(page)} action="Quero me candidatar" />
      <section className="content-layout section">
        <div>
          <span className="section-label">A OPORTUNIDADE</span>
          <Rich page={page} />
        </div>
        <aside
          style={{
            position: 'sticky',
            top: '96px',
            background: 'var(--bg-dark-surface)',
            color: 'var(--text-inverse)',
            padding: '36px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-dark)',
          }}
        >
          <span className="eyebrow light">PROCESSO SELETIVO</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', margin: '14px 0' }}>
            Construa o próximo capítulo com a Antlia.
          </h2>
          <p style={{ color: 'var(--text-inverse-muted)', fontSize: '14px', lineHeight: 1.6 }}>
            Revise os requisitos da vaga e simule sua candidatura neste protótipo visual.
          </p>
          <button className="button signal" style={{ width: '100%', marginTop: '20px' }} onClick={() => navigate('contato')}>
            Iniciar candidatura <ArrowRight size={16} />
          </button>
          <small style={{ display: 'block', marginTop: '16px', color: 'var(--text-inverse-subtle)', fontSize: '12px' }}>
            Nenhum dado é transmitido nesta fase de testes.
          </small>
        </aside>
      </section>
    </>
  )
}

function Profile({ page }: { page: Page }) {
  return (
    <>
      <section
        style={{
          background: 'var(--bg-dark)',
          color: 'var(--text-inverse)',
          padding: '80px max(24px, calc((100vw - 1100px)/2))',
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 340px) 1fr',
          gap: '56px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            height: '380px',
            background: 'var(--bg-dark-surface)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            display: 'grid',
            placeItems: 'center',
            border: '1px solid var(--border-dark)',
          }}
        >
          {page.image ? (
            <img src={page.image} alt={page.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '140px', color: 'var(--antlia-cyan)', fontWeight: 600 }}>
              {page.title[0]}
            </span>
          )}
        </div>
        <div>
          <span className="eyebrow light">LIDERANÇA & PESSOAS</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4.5vw, 56px)', margin: '16px 0 20px' }}>
            {page.title}
          </h1>
          <p style={{ fontSize: '18px', lineHeight: 1.65, color: 'var(--text-inverse-muted)', margin: 0 }}>
            {desc(page)}
          </p>
        </div>
      </section>
      <Structured page={page} />
    </>
  )
}

function Policy({ page }: { page: Page }) {
  return (
    <>
      <PageHero page={page} tag="PRIVACIDADE & GOVERNANÇA" description={desc(page)} />
      <Structured page={page} legal />
    </>
  )
}

function Journey({ page }: { page: Page }) {
  const ok = page.type === 'confirmacao'

  return (
    <>
      <PageHero page={page} tag={ok ? 'ENVIO CONCLUÍDO' : 'JORNADA SEGURA'} description={desc(page)} />
      <section
        className="section"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr',
          gap: '64px',
          alignItems: 'start',
        }}
      >
        <div>
          <span className="section-label">{ok ? 'PRÓXIMO PASSO' : 'PROTÓTIPO VISUAL'}</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', lineHeight: 1.1, margin: '16px 0 20px' }}>
            {ok ? 'Recebemos sua mensagem fictícia.' : 'Uma experiência clara, ágil e focada em negócios.'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '16px' }}>
            {ok
              ? 'A simulação foi realizada com êxito. Nenhum dado pessoal foi enviado ou armazenado nesta demonstração.'
              : 'Nesta fase, os campos validam o fluxo interativo e a ergonomia de contato da Antlia sem persistência em servidores.'}
          </p>
        </div>
        {!ok && <PrototypeForm title={page.title} />}
      </section>
    </>
  )
}

function PageHero({
  page,
  tag,
  title,
  description,
  action,
}: {
  page?: Page
  tag: string
  title?: string
  description: string
  action?: string
}) {
  const h = title || page?.title || 'Antlia'

  return (
    <section className="page-hero">
      <HeroMedia page={page} />
      <div className="hero-overlay" />
      <div className="page-hero-inner">
        <Kicker text={tag} />
        <h1 className={h.length > 52 ? 'long-title' : ''}>{h}</h1>
        <p>{description}</p>
        {action && (
          <button className="button signal" onClick={() => navigate('contato')}>
            {action} <ArrowUpRight size={17} />
          </button>
        )}
      </div>
      <div className="page-index">ANTLIA // {tag}</div>
    </section>
  )
}

function Kicker({ text }: { text: string }) {
  return (
    <div className="hero-kicker">
      <span>ANTLIA</span>
      <i />
      {text}
    </div>
  )
}

function HeroMedia({ page }: { page?: Page }) {
  const src = page?.slug === 'home' ? '/media/home-hero.png' : page?.image || page?.images?.[0] || ''
  return src ? <img className="hero-media" src={src} alt="" /> : <div className="hero-media fallback-media" />
}

function Structured({ page, legal = false }: { page: Page; legal?: boolean }) {
  const blocks = page.blocks.slice(0, 12)
  const p = { ...page, blocks }

  return (
    <section className={`content-layout section ${legal ? 'legal' : ''}`}>
      <aside>
        <span>ÍNDICE DA PÁGINA</span>
        {blocks.map((b, i) => (
          <a key={b.heading + i} href={'#' + id(b.heading)}>
            {b.heading}
          </a>
        ))}
      </aside>
      <Rich page={p} />
    </section>
  )
}

function Rich({ page }: { page: Page }) {
  return (
    <article className="rich-content">
      {page.blocks.map((b, i) => (
        <section id={id(b.heading)} key={b.heading + i} className={i === 0 ? 'lead-block' : ''}>
          <h2>{b.heading}</h2>
          {b.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {b.bullets.length > 0 && (
            <ul>
              {b.bullets.map((x, j) => (
                <li key={j}>
                  <Check size={18} />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  )
}

function Process() {
  return (
    <section
      className="section"
      style={{
        background: 'var(--bg-dark)',
        color: 'var(--text-inverse)',
      }}
    >
      <span className="section-label inverse">CICLO DE TRABALHO</span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginTop: '40px',
        }}
      >
        {['01. Entender', '02. Desenhar', '03. Executar', '04. Evoluir'].map((x, i) => (
          <div
            key={x}
            style={{
              padding: '28px',
              borderLeft: '1px solid var(--border-dark)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--antlia-cyan)' }}>FASE 0{i + 1}</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '20px 0 10px' }}>{x.slice(4)}</h3>
            <p style={{ color: 'var(--text-inverse-subtle)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              {[
                'Imersão profunda no cenário de negócio, desafios e restrições.',
                'Definição de arquitetura robusta, equipe técnica e prioridades.',
                'Engenharia ágil com entregas incrementais e testes contínuos.',
                'Monitoramento de métricas, sustentação operacional e evolução.',
              ][i]}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Card({ page, featured = false }: { page: Page; featured?: boolean }) {
  return (
    <button className={`article-card ${featured ? 'featured' : ''}`} onClick={() => navigate(page.slug)}>
      <div className="article-image">
        {page.image ? (
          <img src={page.image} alt={page.title} loading="lazy" />
        ) : (
          <div className="image-fallback">
            <Sparkles size={32} />
          </div>
        )}
      </div>
      <div className="article-content">
        <div className="article-meta">
          <span>{label(page.type)}</span>
          <ArrowUpRight size={16} />
        </div>
        <h3>{page.title}</h3>
        <p>{desc(page)}</p>
      </div>
    </button>
  )
}

function SectionTitle({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow: string
  title: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="section-head">
      <div>
        <span className="section-label">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-link" onClick={onAction}>
          {action} <ArrowRight size={16} />
        </button>
      )}
    </div>
  )
}

function PrototypeForm({ title }: { title: string }) {
  const [sent, setSent] = useState(false)

  return (
    <form
      className="prototype-form"
      onSubmit={(e) => {
        e.preventDefault()
        setSent(true)
      }}
    >
      <span className="eyebrow light">{title}</span>
      {sent ? (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <ShieldCheck size={48} style={{ color: 'var(--antlia-lime)', margin: '0 auto 16px' }} />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', margin: '0 0 10px' }}>
            Simulação validada com sucesso!
          </h3>
          <p style={{ color: 'var(--text-inverse-muted)', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px' }}>
            Os campos passaram na validação do protótipo visual. Nenhum dado pessoal foi enviado à rede.
          </p>
          <button className="button signal" type="button" onClick={() => setSent(false)}>
            Nova simulação
          </button>
        </div>
      ) : (
        <>
          <div className="form-grid">
            <label>
              Nome completo
              <input required placeholder="Seu nome" />
            </label>
            <label>
              E-mail corporativo
              <input type="email" required placeholder="nome@empresa.com.br" />
            </label>
            <label>
              Telefone
              <input placeholder="(11) 90000-0000" />
            </label>
            <label>
              Empresa
              <input placeholder="Nome da empresa" />
            </label>
            <label className="wide">
              Mensagem ou contexto do desafio
              <textarea rows={4} placeholder="Conte brevemente sobre o seu projeto ou necessidade operacional..." />
            </label>
          </div>
          <button className="button signal" type="submit">
            Simular envio de contato <ArrowRight size={16} />
          </button>
          <small>
            <ShieldCheck size={16} /> Demonstração visual institucional. Nenhum dado é armazenado.
          </small>
        </>
      )}
    </form>
  )
}

function CTA() {
  return (
    <section className="cta-band">
      <div>
        <span className="eyebrow light">PRÓXIMO PASSO</span>
        <h2>Transforme seu próximo desafio tecnológico em capacidade contínua.</h2>
      </div>
      <button className="button signal" onClick={() => navigate('contato')}>
        Conversar com a Antlia <ArrowUpRight size={17} />
      </button>
    </section>
  )
}

function SearchPanel({ close }: { close: () => void }) {
  const [q, setQ] = useState('')
  const results = useMemo(
    () =>
      q.length < 2
        ? []
        : pages
            .filter((p) => (p.title + ' ' + p.description).toLowerCase().includes(q.toLowerCase()))
            .slice(0, 10),
    [q]
  )

  return (
    <motion.div
      className="search-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <button className="search-close" onClick={close} aria-label="Fechar busca global">
        <X size={20} />
      </button>
      <div className="search-box">
        <span className="eyebrow light">BUSCA GLOBAL ANTLIA</span>
        <label>
          <Search size={28} style={{ color: 'var(--antlia-cyan)' }} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Digite para buscar serviços, artigos ou soluções..."
          />
        </label>
        <div className="search-results">
          {results.map((p) => (
            <button
              key={p.slug}
              onClick={() => {
                navigate(p.slug)
                close()
              }}
            >
              <span>{label(p.type)}</span>
              <strong>{p.title}</strong>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Footer() {
  return (
    <footer>
      <div className="footer-main">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Brand light />
          <p>
            Engenharia de software e serviços especializados de TI para operações corporativas que exigem continuidade,
            alta performance e inovação responsável.
          </p>
        </div>
        <div />
        <div className="footer-column">
          <h3>CAPACIDADES</h3>
          <button onClick={() => navigate('nossas-solucoes')}>Ecossistema de Soluções</button>
          <button onClick={() => navigate('desenvolvimento-de-software')}>Desenvolvimento de Software</button>
          <button onClick={() => navigate('outsourcing-ti')}>Outsourcing & Squads</button>
          <button onClick={() => navigate('quality-assurance')}>Quality Assurance</button>
          <button onClick={() => navigate('atendimento-help-desk')}>Help Desk & Sustentação</button>
        </div>
        <div className="footer-column">
          <h3>INSTITUCIONAL</h3>
          <button onClick={() => navigate('home')}>A Antlia</button>
          <button onClick={() => navigate('blog')}>Insights & Artigos</button>
          <button onClick={() => navigate('esg-antlia')}>Governança ESG</button>
          <button onClick={() => navigate('trabalhe-conosco')}>Carreiras & Vagas</button>
        </div>
        <div className="footer-column">
          <h3>CONTATO</h3>
          <a href="mailto:contato@antlia.com.br">contato@antlia.com.br</a>
          <span>+55 11 3017-0999</span>
          <span style={{ lineHeight: 1.5 }}>
            Alameda Campinas, 1100
            <br />
            Jardins, São Paulo — SP
          </span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Antlia Tecnologia e Consultoria. Todos os direitos reservados.</span>
        <div className="footer-legal-links">
          <button onClick={() => navigate('politica-de-privacidade')}>Privacidade</button>
          <button onClick={() => navigate('politica-de-cookies-br')}>Cookies</button>
        </div>
      </div>
    </footer>
  )
}

function NotFound() {
  return (
    <section className="section" style={{ minHeight: '60vh', textAlign: 'center', padding: '120px 24px' }}>
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(96px, 14vw, 160px)',
          fontWeight: 700,
          color: 'var(--border-light)',
          lineHeight: 1,
        }}
      >
        404
      </span>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', margin: '24px 0 16px' }}>
        Esta página não foi encontrada.
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 32px' }}>
        O endereço acessado não existe ou foi realocado no novo mapa do site.
      </p>
      <button className="button signal" onClick={() => navigate('home')}>
        Retornar à página inicial
      </button>
    </section>
  )
}
