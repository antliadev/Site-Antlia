import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  FileCheck2,
  Headphones,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import pagesData from './data/pages.json'
import './App.css'
import { ConstellationShader } from './components/effects/ConstellationShader'
import { BorderBeam } from './components/effects/BorderBeam'
import { SpotlightCard } from './components/effects/SpotlightCard'
import { ScrollProgress } from './components/effects/ScrollProgress'

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
  publishedAt?: string
  modifiedAt?: string
  blocks: Block[]
}

const pages = pagesData as Page[]
const bySlug = new Map(pages.map((p) => [p.slug, p]))

const services = [
  ['desenvolvimento-de-software', Code2, 'Produtos digitais, integração com legados e arquitetura preparada para operação contínua.'],
  ['outsourcing-ti', UsersRound, 'Squads e profissionais integrados ao contexto técnico, ritmo e governança da empresa.'],
  ['quality-assurance', FileCheck2, 'Testes, automação e critérios de aceite incorporados ao ciclo de entrega.'],
  ['atendimento-help-desk', Headphones, 'Sustentação N1, N2 e N3 para manter serviços críticos acompanhados de perto.'],
  ['alocacao-de-programadores', BriefcaseBusiness, 'Especialistas para ampliar capacidade técnica sem perder controle de entrega.'],
] as const

const groups = [
  [
    'Construir',
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
    'Ampliar',
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
    'Operar',
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
  servico: 'SERVIÇO',
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
const cleanText = (value = '') => value.replace(/[\u2014\u2013]/g, '-').replace(/\s+/g, ' ').trim()
const id = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')

const desc = (p: Page) =>
  cleanText(
    p.description && p.description.length < 260
      ? p.description
      : p.blocks.flatMap((b) => b.paragraphs)[0] || 'Conteúdo institucional Antlia.'
  )
const byRecent = (a: Page, b: Page) => (Date.parse(b.publishedAt || '') || 0) - (Date.parse(a.publishedAt || '') || 0)

type NavLinkItem = readonly [label: string, slug: string, descText: string]
type NavCategory = {
  readonly key: string
  readonly label: string
  readonly slug: string
  readonly badge: string
  readonly title: string
  readonly description: string
  readonly links: readonly NavLinkItem[]
}

const navItems: readonly NavCategory[] = [
  {
    key: 'empresa',
    label: 'Empresa',
    slug: 'home',
    badge: 'MISSÃO & CRITÉRIO',
    title: 'Tecnologia com responsabilidade operacional.',
    description: 'Conheça a Antlia, nossa forma de atuar e os sinais que orientam cada entrega.',
    links: [
      ['A Antlia', 'home', 'Posicionamento, DNA de engenharia e cultura institucional'],
      ['Governança ESG', 'esg-antlia', 'Práticas éticas, sustentabilidade e integridade corporativa'],
      ['Carreiras', 'trabalhe-conosco', 'Oportunidades para engenheiros e líderes técnicos'],
    ],
  },
  {
    key: 'capacidades',
    label: 'Capacidades',
    slug: 'nossas-solucoes',
    badge: 'ENGENHARIA INTEGRADA',
    title: 'Frentes técnicas para construir, ampliar e sustentar.',
    description: 'Software, squads, qualidade e suporte organizados conforme o momento do seu projeto.',
    links: services.map(([slug, , descText]) => [
      cleanText(bySlug.get(slug)?.title) || slug,
      slug,
      descText,
    ]),
  },
  {
    key: 'insights',
    label: 'Insights',
    slug: 'blog',
    badge: 'CONHECIMENTO TÉCNICO',
    title: 'Leituras para decisões técnicas mais seguras.',
    description: 'Artigos e conteúdos institucionais para equipes que precisam evoluir com critério.',
    links: [
      ['Todos os artigos', 'blog', 'Publicações sobre arquitetura, liderança e engenharia'],
      ['Soluções Antlia', 'nossas-solucoes', 'Catálogo completo de entregas e serviços'],
      ['Falar com especialista', 'contato', 'Diagnóstico preliminar e desenho de solução'],
    ],
  },
  {
    key: 'esg',
    label: 'ESG',
    slug: 'esg-antlia',
    badge: 'GOVERNANÇA & DADOS',
    title: 'Governança aplicada ao jeito de entregar.',
    description: 'Princípios de responsabilidade, segurança e continuidade conectados a tecnologia.',
    links: [
      ['Governança ESG', 'esg-antlia', 'Compromisso com impacto positivo e governança sólida'],
      ['Privacidade', 'politica-de-privacidade', 'Diretrizes de proteção e conformidade LGPD'],
      ['Cookies', 'politica-de-cookies-br', 'Transparência no uso de dados e navegação'],
    ],
  },
  {
    key: 'carreiras',
    label: 'Carreiras',
    slug: 'trabalhe-conosco',
    badge: 'TALENTOS & SQUADS',
    title: 'Pessoas técnicas para problemas concretos.',
    description: 'Conheça oportunidades e a forma como conectamos profissionais ao contexto certo.',
    links: [
      ['Trabalhe conosco', 'trabalhe-conosco', 'Vagas abertas para desenvolvedores e arquitetos'],
      ['Alocação de profissionais', 'alocacao-de-programadores', 'Squads e especialistas sob medida para sua demanda'],
      ['Contato', 'contato', 'Fale diretamente com nossa equipe de pessoas e tecnologia'],
    ],
  },
] as const

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
        src={light ? '/brand/logo-antlia-branca.png' : '/brand/logo-antlia-horizontal.png'}
        alt="Antlia Consultoria e Tecnologia"
        width="180"
        height="60"
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
  const [activeNav, setActiveNav] = useState<string | null>(null)
  const [search, setSearch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const update = () => {
      setSlug(route(location.pathname))
      setMenu(false)
      setActiveNav(null)
    }
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])

  const page = bySlug.get(slug)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = page?.seoTitle || 'Antlia | Consultoria e Tecnologia'
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [page, slug])

  return (
    <div className="app-shell">
      <ScrollProgress />
      <Header
        menu={menu}
        setMenu={setMenu}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        openSearch={() => setSearch(true)}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={slug}
          className="main-content"
          initial={typeof window !== 'undefined' ? { opacity: 0, y: 12, filter: 'blur(3px)' } : false}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        >
          {page ? <Router page={page} /> : <NotFound />}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <AnimatePresence>{search && <SearchPanel close={() => setSearch(false)} />}</AnimatePresence>
    </div>
  )
}

const fanContainerVariants: Variants = {
  hidden: {
    opacity: 0,
    height: 0,
    scaleY: 0.93,
    transformOrigin: 'top center',
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    height: 'auto',
    scaleY: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    scaleY: 0.95,
    filter: 'blur(5px)',
    transition: {
      duration: 0.22,
      ease: [0.32, 0, 0.67, 0] as [number, number, number, number],
    },
  },
}

const fanGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

const fanBladeVariants: Variants = {
  hidden: ({ index, total }: { index: number; total: number }) => {
    const center = Math.max(1, (total - 1) / 2)
    const offset = total > 1 ? (index - center) / center : 0
    return {
      opacity: 0,
      y: 28,
      x: offset * 22,
      rotateZ: offset * 4.5,
      rotateX: -18,
      scale: 0.92,
      filter: 'blur(3px)',
      transformOrigin: 'top center',
    }
  },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    rotateZ: 0,
    rotateX: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring' as const,
      stiffness: 270,
      damping: 24,
      mass: 0.85,
    },
  },
  exit: ({ index, total }: { index: number; total: number }) => {
    const center = Math.max(1, (total - 1) / 2)
    const offset = total > 1 ? (index - center) / center : 0
    return {
      opacity: 0,
      y: -8,
      rotateZ: offset * 2.5,
      scale: 0.96,
      transition: { duration: 0.16, ease: 'easeIn' },
    }
  },
}

function Header({
  menu,
  setMenu,
  activeNav,
  setActiveNav,
  openSearch,
}: {
  menu: boolean
  setMenu: (v: boolean) => void
  activeNav: string | null
  setActiveNav: (v: string | null) => void
  openSearch: () => void
}) {
  const activeItem = navItems.find((item) => item.key === activeNav)
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnterItem = (key: string) => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    setActiveNav(key)
  }

  const handleMouseLeaveHeader = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveNav(null)
    }, 180)
  }

  const handleMouseEnterHeader = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    }
  }, [])

  return (
    <header
      className="site-header"
      onMouseEnter={handleMouseEnterHeader}
      onMouseLeave={handleMouseLeaveHeader}
    >
      <div className="header-inner">
        <Brand />
        <nav
          className={menu ? 'nav open' : 'nav'}
          aria-label="Navegação Principal"
          onMouseEnter={() => {
            if (!activeNav && !menu) setActiveNav('capacidades')
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.key}
              className={activeNav === item.key ? 'nav-link active' : 'nav-link'}
              onMouseEnter={() => handleMouseEnterItem(item.key)}
              onFocus={() => handleMouseEnterItem(item.key)}
              onClick={() => {
                navigate(item.slug)
                setActiveNav(null)
                setMenu(false)
              }}
              aria-expanded={activeNav === item.key}
            >
              {activeNav === item.key && (
                <motion.span
                  layoutId="navHoverPill"
                  className="nav-hover-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="nav-link-label">{item.label}</span>
              <ChevronDown
                size={12}
                className={`nav-chevron ${activeNav === item.key ? 'open' : ''}`}
              />
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={openSearch} aria-label="Abrir busca global">
            <Search size={18} />
          </button>
          <button className="contact-button" onClick={() => navigate('contato')}>
            Conversar <ArrowUpRight size={16} />
          </button>
          <button
            className="icon-button menu-toggle"
            onClick={() => {
              setMenu(!menu)
              setActiveNav(null)
            }}
            aria-label={menu ? 'Fechar menu' : 'Abrir menu'}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {activeItem && !menu && (
          <NavPanel
            item={activeItem}
            close={() => setActiveNav(null)}
          />
        )}
      </AnimatePresence>
    </header>
  )
}

function NavPanel({ item, close }: { item: NavCategory; close: () => void }) {
  const total = item.links.length

  return (
    <motion.div
      className="nav-panel"
      variants={fanContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="nav-panel-beam" />
      <div className="nav-panel-glow" />
      <motion.div
        key={item.key}
        className="nav-panel-inner"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="nav-panel-intro"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="nav-panel-meta">
            <span className="eyebrow light">{item.badge}</span>
            <span className="nav-panel-status">
              <span className="status-ping" />
              SLA 99.9%
            </span>
          </div>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
          <button
            className="nav-panel-cta"
            onClick={() => {
              navigate(item.slug)
              close()
            }}
          >
            <span>Ver {item.label.toLowerCase()}</span>
            <ArrowRight size={15} />
          </button>
        </motion.div>

        <motion.div
          className="nav-panel-grid"
          variants={fanGridVariants}
          initial="hidden"
          animate="visible"
        >
          {item.links.map(([label, slug, descText], index) => (
            <motion.button
              key={slug}
              className="nav-panel-card"
              custom={{ index, total }}
              variants={fanBladeVariants}
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                navigate(slug)
                close()
              }}
            >
              <div className="nav-panel-card-head">
                <strong>{label}</strong>
                <div className="nav-panel-card-icon">
                  <ArrowUpRight size={13} />
                </div>
              </div>
              {descText && <p className="nav-panel-card-desc">{descText}</p>}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
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
    .sort(byRecent)
    .slice(0, 6)

  return (
    <>
      <section className="home-hero">
        <HeroMedia page={bySlug.get('home')} />
        <div className="hero-overlay" />
        <ConstellationShader />
        <div className="home-hero-inner">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <Kicker text="ENGENHARIA DE MISSÃO CRÍTICA" />
            <h1>
              Engenharia digital para operações críticas.
            </h1>
            <p>
              Software, squads, qualidade e sustentação para empresas que precisam evoluir sem interromper a operação.
            </p>
            <div className="hero-actions">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="button signal"
                onClick={() => navigate('contato')}
              >
                Conversar com a Antlia <ArrowUpRight size={17} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="button ghost"
                onClick={() => navigate('nossas-solucoes')}
              >
                Ver serviços
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="statement section">
        <span className="section-label">Como atuamos</span>
        <div>
          <h2>Tecnologia tratada como continuidade de negócio.</h2>
          <p>
            A Antlia combina engenharia de software, squads especializados, qualidade e sustentação para empresas que
            dependem de sistemas estáveis, integrados e preparados para mudança.
          </p>
        </div>
      </section>

      <section className="capabilities">
        <div className="capabilities-head">
          <span className="section-label">Serviços</span>
          <h2>
            Cinco frentes para construir, ampliar e sustentar.
          </h2>
        </div>
        <div className="capability-list">
          {services.map(([slug, Icon, d]) => (
            <button className="capability-row" key={slug} onClick={() => navigate(slug)}>
              <div className="capability-row-icon">
                <Icon size={22} />
              </div>
              <div>
                <h3>{cleanText(bySlug.get(slug)?.title)}</h3>
                <p>{d}</p>
              </div>
              <ArrowUpRight className="capability-row-arrow" size={20} />
            </button>
          ))}
        </div>
      </section>

      <section className="operating-model section">
        <div>
          <span className="section-label inverse">Método</span>
          <h2>Do diagnóstico à sustentação.</h2>
          <p className="subtext">
            As equipes entram no contexto do cliente, organizam prioridades técnicas e mantêm clareza sobre risco, entrega e operação.
          </p>
        </div>
        <div className="operating-steps">
          {[
            {
              title: 'Diagnóstico técnico',
              desc: 'Leitura do cenário, restrições, integrações e riscos antes de propor equipe ou solução.',
            },
            {
              title: 'Desenho de entrega',
              desc: 'Definição de arquitetura, responsabilidades, cadência e critérios de qualidade.',
            },
            {
              title: 'Execução acompanhada',
              desc: 'Squads, especialistas e QA trabalhando com visibilidade sobre avanço e impedimentos.',
            },
            {
              title: 'Sustentação e evolução',
              desc: 'Acompanhamento contínuo para reduzir recorrência de incidentes e manter o sistema evoluindo.',
            },
          ].map((item) => (
            <div className="operating-step" key={item.title}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bento-section">
        <SectionTitle
          eyebrow="Evidências"
          title="O que a marca precisa comunicar em cada entrega."
        />
        <div className="bento-grid">
          <SpotlightCard className="bento-card col-8 dark-theme" spotlightColor="rgba(34, 211, 238, 0.22)">
            <BorderBeam colorFrom="#22d3ee" colorTo="#0071e3" duration={7} borderWidth={1.5} />
            <span className="bento-tag">Operação crítica</span>
            <div>
              <h3>Disponibilidade tratada como requisito de projeto.</h3>
              <p>
                Em software, squads ou sustentação, a discussão começa pelo impacto operacional: o que não pode parar,
                o que precisa evoluir e onde o risco precisa estar visível.
              </p>
            </div>
          </SpotlightCard>
          <SpotlightCard className="bento-card col-4" spotlightColor="rgba(0, 113, 227, 0.12)">
            <span className="bento-tag">Parceria técnica</span>
            <h3>Microsoft Partner</h3>
            <p>
              Sinaliza atuação conectada ao ecossistema corporativo de nuvem, aplicações e modernização.
            </p>
          </SpotlightCard>
          <SpotlightCard className="bento-card col-4" spotlightColor="rgba(0, 113, 227, 0.12)">
            <span className="bento-tag">Times e especialistas</span>
            <h3>Capacidade dedicada</h3>
            <p>
              Profissionais alocados com recorte de senioridade, tecnologia e aderência ao momento do projeto.
            </p>
          </SpotlightCard>
          <SpotlightCard className="bento-card col-8 proof-card" spotlightColor="rgba(34, 211, 238, 0.14)">
            <img src="/media/quality-assurance-dashboard.png" alt="" />
            <div>
              <span className="bento-tag">Ritual de entrega</span>
              <h3>Discussões técnicas apoiadas por evidência visível.</h3>
              <p>
                O trabalho precisa mostrar contexto, prioridade e impacto: menos promessa genérica, mais clareza sobre
                o que será construído, testado, sustentado e acompanhado.
              </p>
            </div>
          </SpotlightCard>
        </div>
      </section>

      <section className="insights section">
        <SectionTitle
          eyebrow="Conteúdo"
          title="Leituras para decisões técnicas mais seguras."
          action="Ver todas as publicações"
          onAction={() => navigate('blog')}
        />
        <div className="editorial-grid">
          {latest.slice(0, 3).map((a, i) => (
            <Card key={a.slug} page={a} featured={i === 0} />
          ))}
        </div>
      </section>

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
        title="Serviços para cada etapa da operação digital."
        description="Combine engenharia, especialistas, qualidade e sustentação conforme o momento técnico da sua empresa."
      />
      <section className="solution-catalog section">
        {groups.map(([verb, group, slugs]) => (
          <div className="solution-group" key={group}>
            <div className="group-title">
              <small>{verb}</small>
              <h2>{group}</h2>
            </div>
            <div className="solution-links">
              {slugs.map((s) => {
                const p = bySlug.get('solucoes-antlia_' + s) || bySlug.get(s)
                return (
                  p && (
                    <button key={p.slug} onClick={() => navigate(p.slug)}>
                      <span>{cleanText(p.title)}</span>
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
    .sort(byRecent)
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
              {cleanText(c.title.replace('Arquivos ', ''))}
            </button>
          ))}
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {articles.length} publicações disponíveis
        </span>
      </section>
      <section className="article-list section">
        {articles.map((a, i) => (
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
        <SectionTitle eyebrow="Relacionado" title="Outros serviços próximos." />
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
      <PageHero page={page} tag={esg ? 'AMBIENTAL, SOCIAL E GOVERNANÇA' : label(page.type)} description={desc(page)} />
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
              <b style={{ fontFamily: 'var(--font-display)', fontSize: '56px', color: 'var(--antlia-blue)', lineHeight: 1 }}>{x[0]}</b>
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
          <span>Leitura</span>
          <strong style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
            {Math.max(3, Math.ceil(page.blocks.flatMap((b) => b.paragraphs).join(' ').split(' ').length / 210))} min
          </strong>
          <i />
        </aside>
        <div>
          <div className="answer-box">
            <span>Resumo</span>
            <p>{page.blocks.flatMap((b) => b.paragraphs)[0] || desc(page)}</p>
          </div>
          <Rich page={page} />
        </div>
      </section>
      {related.length > 0 && (
        <section className="related section" style={{ background: 'var(--bg-subtle)' }}>
          <SectionTitle eyebrow="Relacionado" title="Outras leituras." />
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
          <span className="section-label">A oportunidade</span>
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
          <span className="eyebrow light">Processo seletivo</span>
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
          <span className="eyebrow light">Liderança e pessoas</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4.5vw, 56px)', margin: '16px 0 20px' }}>{cleanText(page.title)}</h1>
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
      <PageHero page={page} tag="PRIVACIDADE E GOVERNANÇA" description={desc(page)} />
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
          <span className="section-label">{ok ? 'Próximo passo' : 'Protótipo visual'}</span>
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
  const h = cleanText(title || page?.title || 'Antlia')

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
    </section>
  )
}

function Kicker({ text }: { text: string }) {
  return (
    <div className="hero-kicker">
      {text}
    </div>
  )
}

function HeroMedia({ page }: { page?: Page }) {
  const src = page?.slug === 'home' ? '/media/home-hero.png' : ''
  return src ? <img className="hero-media" src={src} alt="" /> : <div className="hero-media fallback-media" />
}

function Structured({ page, legal = false }: { page: Page; legal?: boolean }) {
  const blocks = page.blocks.slice(0, 12)
  const p = { ...page, blocks }

  return (
    <section className={`content-layout section ${legal ? 'legal' : ''}`}>
      <aside>
        <span>Nesta página</span>
        {blocks.map((b, i) => (
          <a key={b.heading + i} href={'#' + id(b.heading)}>
            {cleanText(b.heading)}
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
          <h2>{cleanText(b.heading)}</h2>
          {b.paragraphs.map((p, j) => (
            <p key={j}>{cleanText(p)}</p>
          ))}
          {b.bullets.length > 0 && (
            <ul>
              {b.bullets.map((x, j) => (
                <li key={j}>
                  <Check size={18} />
                    <span>{cleanText(x)}</span>
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
      <span className="section-label inverse">Ciclo de trabalho</span>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '32px',
          marginTop: '40px',
        }}
      >
        {['Entender', 'Desenhar', 'Executar', 'Evoluir'].map((x, i) => (
          <div
            key={x}
            style={{
              padding: '28px',
              borderLeft: '1px solid var(--border-dark)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 10px' }}>{x}</h3>
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
  const [imgError, setImgError] = useState(false)
  const hasValidImage = Boolean(page.image && !page.image.includes('gravatar.com') && !page.image.includes('/avatar/') && !imgError)

  return (
    <button className={`article-card ${featured ? 'featured' : ''}`} onClick={() => navigate(page.slug)}>
      {featured && <BorderBeam colorFrom="#22d3ee" colorTo="#0071e3" duration={9} borderWidth={1.5} />}
      <div className="article-image">
        {hasValidImage ? (
          <img
            src={page.image!}
            alt={cleanText(page.title)}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="image-fallback">
            <img src="/brand/simbolo-antlia-gradiente.png" alt="Antlia" loading="lazy" />
          </div>
        )}
      </div>
      <div className="article-content">
        <div className="article-meta">
          <span>{label(page.type)}</span>
          <ArrowUpRight size={16} />
        </div>
        <h3>{cleanText(page.title)}</h3>
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
        <span className="eyebrow light">{cleanText(title)}</span>
      {sent ? (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <ShieldCheck size={48} style={{ color: 'var(--antlia-blue-light)', margin: '0 auto 16px' }} />
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
        <span className="eyebrow light">Próximo passo</span>
        <h2>Traga contexto. A Antlia ajuda a organizar o caminho técnico.</h2>
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
        <span className="eyebrow light">Busca Antlia</span>
        <label>
          <Search size={28} style={{ color: 'var(--antlia-cyan)' }} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Busque serviços, artigos ou soluções"
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
              <strong>{cleanText(p.title)}</strong>
              <ArrowUpRight size={16} />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function Footer() {
  const socials = [
    ['WhatsApp', 'https://wa.me/5511976399943?text=Tenho%20interesse%20em%20saber%20mais%20sobre%20as%20solucoes%20da%20Antlia', 'whatsapp'],
    ['LinkedIn', 'https://www.linkedin.com/company/antlia_2', 'linkedin'],
    ['Instagram', 'https://www.instagram.com/antliaconsultoria/', 'instagram'],
    ['YouTube', 'https://www.youtube.com/channel/UC9xx7t_OHO8AIbgqSJnNWfQ', 'youtube'],
  ] as const

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
          <h3>Serviços</h3>
          <button onClick={() => navigate('nossas-solucoes')}>Ecossistema de Soluções</button>
          <button onClick={() => navigate('desenvolvimento-de-software')}>Desenvolvimento de Software</button>
          <button onClick={() => navigate('outsourcing-ti')}>Outsourcing & Squads</button>
          <button onClick={() => navigate('quality-assurance')}>Quality Assurance</button>
          <button onClick={() => navigate('atendimento-help-desk')}>Help Desk & Sustentação</button>
        </div>
        <div className="footer-column">
          <h3>Institucional</h3>
          <button onClick={() => navigate('home')}>A Antlia</button>
          <button onClick={() => navigate('blog')}>Insights & Artigos</button>
          <button onClick={() => navigate('esg-antlia')}>Governança ESG</button>
          <button onClick={() => navigate('trabalhe-conosco')}>Carreiras & Vagas</button>
        </div>
        <div className="footer-column">
          <h3>Contato</h3>
          <a className="contact-line" href="tel:+551130170999">
            <Phone size={15} /> +55 11 3017-0999
          </a>
          <a className="contact-line" href="tel:+5511976399943">
            <Phone size={15} /> +55 11 97639-9943
          </a>
          <a className="contact-line" href="mailto:contato@antlia.com.br">
            <Mail size={15} /> contato@antlia.com.br
          </a>
          <div className="social-links" aria-label="Redes sociais da Antlia">
            {socials.map(([name, href, icon]) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={name}
                className="social-link"
              >
                <SocialGlyph icon={icon} />
              </a>
            ))}
          </div>
          <span style={{ lineHeight: 1.5 }}>
            Alameda Campinas, 1100
            <br />
            Jardins, São Paulo - SP
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

function SocialGlyph({ icon }: { icon: 'whatsapp' | 'linkedin' | 'instagram' | 'youtube' }) {
  if (icon === 'whatsapp') return <MessageCircle size={18} />

  if (icon === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6.3 8.9H3.1v11.2h3.2V8.9ZM4.7 4a1.9 1.9 0 1 0 0 3.8 1.9 1.9 0 0 0 0-3.8Zm15.9 9.7c0-3.1-1.7-5.1-4.4-5.1-1.6 0-2.7.8-3.3 1.7V8.9H9.7v11.2h3.2v-5.9c0-1.6.9-2.6 2.3-2.6 1.3 0 2.1.9 2.1 2.6v5.9h3.3v-6.4Z" />
      </svg>
    )
  }

  if (icon === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7.6 3.2h8.8A4.4 4.4 0 0 1 20.8 7.6v8.8a4.4 4.4 0 0 1-4.4 4.4H7.6a4.4 4.4 0 0 1-4.4-4.4V7.6a4.4 4.4 0 0 1 4.4-4.4Zm0 2A2.4 2.4 0 0 0 5.2 7.6v8.8a2.4 2.4 0 0 0 2.4 2.4h8.8a2.4 2.4 0 0 0 2.4-2.4V7.6a2.4 2.4 0 0 0-2.4-2.4H7.6Zm4.4 3.4a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Zm0 2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm4-2.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M21.6 7.1a3 3 0 0 0-2.1-2.1C17.6 4.5 12 4.5 12 4.5s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9 2 12 2 12s0 3 .4 4.9A3 3 0 0 0 4.5 19c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.9Zm-11.6 8V8.9l5.2 3.1-5.2 3.1Z" />
    </svg>
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
