# Design System: Antlia

## Aesthetic Direction: Swiss Minimalism & Enterprise Precision
Inspirado na precisão editorial e sobriedade de engenharia de ponta (referência de acabamento nível Apple): tipografia com contraste hierárquico claro, alternância rítmica entre luz e sombra, ausência total de ornamentos supérfluos (zero slop) e micro-interações táteis e fluidas.

## Color Tokens & Palette
- **Canvas Principal:** `#ffffff` (`--bg-canvas`)
- **Superfície Sutil:** `#f4f8fd` (`--bg-subtle`)
- **Superfície Escura (Capítulos Noturnos):** `#07182d` (`--bg-dark`)
- **Superfície Escura Elevada:** `#0a2038` (`--bg-dark-surface`)
- **Card Noturno:** `#102a48` (`--bg-dark-card`)
- **Azul Primário Antlia:** `#1e88e5` (`--antlia-blue`) / Hover: `#0066e3` (`--antlia-blue-hover`)
- **Azul Céu / Acento:** `#00a4ff` (`--antlia-cyan`) / Glow: `rgba(0, 164, 255, 0.14)`
- **Texto Principal:** `#0c1b31` (`--text-primary`) — Contraste mínimo 9:1 sobre o canvas
- **Texto Secundário:** `#4f5c6d` (`--text-secondary`) — Contraste mínimo 5.2:1
- **Texto Inverso:** `#f8fafc` (`--text-inverse`) sobre superfícies escuras

## Typography
- **Display / Títulos:** `'Montserrat', sans-serif` (`--font-display`), weights 600 e 700. Tracking: `-0.02em` a `-0.03em`.
- **Corpo / Leitura:** `'Inter', sans-serif` (`--font-body`), weights 400 e 500. Measure limitado a 65–75ch para conforto cognitivo.
- **Rótulos Técnicos / Metadados:** `'Inter', sans-serif` (`--font-mono`), weight 600, uppercase, tracking `0.06em`.

## Spacing & Grid System
- **Escala de Espaçamento:** Base 4px/8px (`8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).
- **Container Máximo:** `1160px` no header; `1280px` nas seções editoriais com padding de segurança dinâmico `clamp(20px, 4vw, 48px)`.
- **Bento Grid:** 12 colunas assimétricas (`col-8` e `col-4`) para dinamismo e hierarquia de leitura.

## Micro-interactions & Motion Rules
- **Aceleração GPU:** Todas as transições usam exclusivamente `transform`, `opacity`, `background-color`, `border-color` e `box-shadow`.
- **Proibição de Layout Thrash:** Proibido animar `padding`, `margin`, `width`, `height` ou `gap`.
- **Curva de Animação:** `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)`. Duração padrão: 160ms para hover rápido, 260ms para transições normais.
- **Feedback Tátil:** Botões e controles interativos possuem `:active { transform: scale(0.97); }`.
- **Acessibilidade de Movimento:** `@media (prefers-reduced-motion: reduce)` zera tempos de animação para respeitar sensibilidade vestibular.

## Mechanical Checks (Impeccable & UI-UX Pro Max)
- Zero bordas grossas unilaterais (`border-left > 1px` em cards banido).
- Zero sombras duras artificiais sem difusão.
- Navegação por teclado com anéis de foco (`:focus-visible`) visíveis e personalizados.
- Alvos de toque móveis com área mínima de 44x44px.
