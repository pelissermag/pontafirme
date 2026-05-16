# Prompts de Frontend — Site Esportivo de Futebol
> Paleta: Branco, Vermelho e Preto | Páginas: Início · Jogadores · Fotos · Vídeos

---

## PROMPT 1 — DESKTOP

```
Você é um designer e desenvolvedor frontend sênior especializado em sites esportivos de alto impacto visual.

Crie um site completo em React com React Router para um grupo de futebol amador/semi-profissional.
O site deve ter 4 páginas: INÍCIO, JOGADORES, FOTOS e VÍDEOS.

---

### IDENTIDADE VISUAL

Paleta de cores EXCLUSIVA:
- Vermelho principal: #CC0000
- Vermelho escuro (hover/acento): #990000
- Preto sólido: #0A0A0A
- Branco puro: #FFFFFF
- Cinza escuro (superfícies): #1A1A1A
- Cinza médio (bordas sutis): #2E2E2E

Tipografia:
- Títulos/Display: fonte "Bebas Neue" (Google Fonts) — toda em maiúsculas, peso visual fortíssimo
- Corpo/UI: fonte "Barlow Condensed" ou "Oswald" (Google Fonts) — peso 400 e 600
- Números e estatísticas: "Bebas Neue"
- NÃO usar Inter, Roboto, Arial ou fontes genéricas

---

### LAYOUT DESKTOP (min-width: 1024px)

**NAVBAR (fixo no topo)**
- Fundo preto (#0A0A0A) com borda inferior vermelha (2px, #CC0000)
- Logo do clube à esquerda (espaço reservado: circle com iniciais em branco sobre fundo vermelho)
- Links de navegação centralizados: INÍCIO · JOGADORES · FOTOS · VÍDEOS
- Link ativo com underline vermelho animado (sliding underline com CSS transition)
- Altura: 64px
- Sem hamburguer — links sempre visíveis no desktop

**PÁGINA: INÍCIO**
Layout editorial de impacto máximo:
- Hero fullscreen (100vh): imagem de fundo escura (use um gradiente preto + vermelho diagonal como placeholder), texto centralizado com nome do clube em Bebas Neue 96px, tagline abaixo em 24px, botão CTA "CONHEÇA O ELENCO" em vermelho
- Seção "PRÓXIMO JOGO": card horizontal com fundo #1A1A1A, times (escudo + nome), placar placeholder, data/local
- Seção "ÚLTIMAS NOTÍCIAS": grid 3 colunas, cards com imagem (placeholder cinza), categoria em vermelho, título em branco, data em cinza
- Seção "ESTATÍSTICAS DA TEMPORADA": 4 métricas em destaque (Jogos, Vitórias, Gols, Título) com números gigantes em Bebas Neue e labels em Barlow
- Footer: fundo preto, logo, links rápidos, redes sociais, copyright

**PÁGINA: JOGADORES**
- Header da página: fundo preto com textura sutil de ruído, título "ELENCO" em Bebas Neue 72px, subtítulo com temporada
- Filtros horizontais por posição: TODOS · GOLEIROS · DEFENSORES · MEIO-CAMPISTAS · ATACANTES (pills com hover vermelho)
- Grid responsivo: 4 colunas → cards de jogador
  - Card: fundo #1A1A1A, imagem do jogador com crop no topo (placeholder com silhueta), número do jogador em Bebas Neue 48px vermelho no canto superior direito, nome do jogador em Bebas Neue 20px branco, posição em Barlow 12px vermelho, hover: borda vermelha + leve escala
  - Ao clicar no card: abre modal com stats detalhadas (jogos, gols, assistências, cartões)

**PÁGINA: FOTOS**
- Header com título "GALERIA" em Bebas Neue 72px
- Filtros por categoria/data: pills horizontais
- Masonry grid ou grid de 3 colunas com proporção quadrada/retangular alternada
- Cards com overlay ao hover: escurece + ícone de lupa + nome da categoria em vermelho
- Lightbox ao clicar: navegação com setas, fundo preto com 95% opacidade, fechar com ESC ou X
- Placeholders: divs com gradientes preto/cinza escuro simulando fotos

**PÁGINA: VÍDEOS**
- Header com título "VÍDEOS" em Bebas Neue 72px
- Grid 3 colunas: cards de vídeo com thumbnail (placeholder), ícone de play centralizado (círculo vermelho), título do vídeo, duração no canto inferior direito, data
- Featured video: card hero largo (span 3 colunas) no topo
- Player inline: ao clicar mostra iframe do YouTube (ou placeholder de player customizado)
- Categorias: MELHORES MOMENTOS · JOGOS COMPLETOS · BASTIDORES

---

### COMPORTAMENTO E INTERAÇÕES

- Transições de página com fade suave (200ms)
- Scroll reveal nas seções: elementos entram de baixo com opacity 0 → 1 + translateY
- Hover nos cards: escala 1.02, borda vermelha, transition 200ms ease
- Navbar: ao scrollar >80px, adicionar sombra vermelha sutil (box-shadow)
- Active states nos filtros: fundo vermelho, texto branco
- Cursor padrão do sistema

---

### ESTRUTURA DE ARQUIVOS

src/
├── components/
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── PlayerCard.jsx
│   ├── PhotoCard.jsx
│   ├── VideoCard.jsx
│   ├── Modal.jsx
│   └── Lightbox.jsx
├── pages/
│   ├── Home.jsx
│   ├── Players.jsx
│   ├── Photos.jsx
│   └── Videos.jsx
├── styles/
│   └── globals.css   ← variáveis CSS, reset, fontes
└── App.jsx           ← React Router setup

---

### DADOS MOCK

Use dados mock realistas em português para popular todas as páginas:
- 16 jogadores com nome brasileiro, posição, número, stats
- 12 fotos com título e categoria
- 8 vídeos com título, duração, data
- 3 notícias para a home

---

### RESTRIÇÕES TÉCNICAS

- React + React Router v6
- CSS Modules ou Styled Components (sem Tailwind)
- Sem dependências pesadas além de react-router-dom
- Fontes via Google Fonts no index.html
- Totalmente funcional sem backend (dados mock em arquivos JS)
- Build compatível com Vercel (sem server-side)

---

### QUALIDADE ESPERADA

O resultado deve parecer o site oficial de um clube de futebol profissional — não um projeto de estudante. Cada detalhe importa: espaçamento, hierarquia tipográfica, contraste, alinhamento. O vermelho deve ser usado com intenção, nunca decorativamente. O preto deve dominar com o vermelho como acento agressivo e cirúrgico.
```

---

## PROMPT 2 — MOBILE

```
Você é um designer e desenvolvedor frontend especializado em experiências mobile-first para sites esportivos.

Crie o frontend MOBILE em React de um site para um grupo de futebol, com 4 páginas: INÍCIO, JOGADORES, FOTOS e VÍDEOS.
Viewport alvo: 375px–430px (iPhone SE ao iPhone Pro Max).

---

### IDENTIDADE VISUAL (idêntica ao desktop)

Paleta:
- Vermelho: #CC0000 | Vermelho escuro: #990000
- Preto: #0A0A0A | Superfícies: #1A1A1A | Bordas: #2E2E2E
- Branco: #FFFFFF

Tipografia:
- Títulos: "Bebas Neue" (Google Fonts)
- Corpo/UI: "Barlow Condensed" (Google Fonts)

---

### LAYOUT MOBILE (max-width: 430px)

**BOTTOM NAVIGATION BAR (fixo na base)**
- Fundo preto (#0A0A0A), borda superior vermelha (1.5px)
- 4 ícones + labels: Início · Jogadores · Fotos · Vídeos
- Ícone ativo: vermelho; inativos: cinza #666
- Altura: 56px + safe area (env(safe-area-inset-bottom))
- NÃO usar navbar no topo — tela toda para conteúdo

**TOPBAR (fixo no topo)**
- Fundo preto, altura 52px
- Logo/escudo à esquerda (40px)
- Nome do clube centralizado em Bebas Neue 20px
- Ícone de busca à direita (opcional)

**PÁGINA: INÍCIO**
- Hero: 70vw de altura, gradiente preto→vermelho diagonal, nome do clube em Bebas Neue 56px, tagline 16px, botão CTA full-width vermelho
- Card "PRÓXIMO JOGO": fundo #1A1A1A, layout horizontal compacto, texto reduzido
- "ÚLTIMAS NOTÍCIAS": scroll horizontal (overflow-x: auto, snap scroll), cards 280px de largura, imagem + título + data
- "DESTAQUES DA TEMPORADA": 2x2 grid de métricas, números em Bebas Neue 40px
- Sem footer extenso — apenas 1 linha de copyright antes da bottom nav

**PÁGINA: JOGADORES**
- Header compacto: "ELENCO" em Bebas Neue 48px, padding 16px
- Filtros por posição: scroll horizontal com pills, sem quebra de linha
- Grid 2 colunas, cards compactos:
  - Altura fixa: 200px
  - Imagem/silhueta no topo ocupando 60% do card
  - Número em Bebas Neue 32px vermelho sobreposto (top-right)
  - Nome em Bebas Neue 16px branco
  - Posição em Barlow 11px vermelho
  - Tap no card: abre bottom sheet com stats (não modal — bottom sheet desliza de baixo)

**Bottom Sheet de Jogador:**
- Fundo #1A1A1A, borda-radius top 20px, altura 60vh
- Handle bar cinza no topo
- Foto grande, nome em Bebas Neue 36px, posição, número
- Grid 2x2 de stats: Jogos / Gols / Assistências / Cartões
- Fechar: swipe down ou tap no overlay

**PÁGINA: FOTOS**
- Header: "GALERIA" em Bebas Neue 48px
- Filtros: scroll horizontal com pills
- Grid 3 colunas, imagens quadradas (aspect-ratio: 1/1)
- Tap: abre lightbox fullscreen nativo mobile
  - Fundo #000
  - Swipe horizontal para navegar entre fotos
  - X no canto superior direito para fechar
  - Contador "3/12" em canto superior esquerdo

**PÁGINA: VÍDEOS**
- Header: "VÍDEOS" em Bebas Neue 48px
- Featured video: card full-width, thumbnail 16:9 com ícone play central (botão circular vermelho 56px)
- Lista de vídeos: cards full-width empilhados, thumbnail à esquerda (100px), título + duração à direita
- Tap: abre player fullscreen (iframe YouTube ou placeholder com controles simulados)

---

### TOUCH E PERFORMANCE MOBILE

- Todos os tap targets mínimo 44x44px (acessibilidade iOS/Android)
- Scroll com -webkit-overflow-scrolling: touch
- Animações com will-change: transform onde necessário
- Nenhuma hover interaction — usar active states (`:active`) ao invés de `:hover`
- Bottom sheet com touch drag usando pointer events
- Evitar position: fixed fora de topbar e bottombar
- Imagens com loading="lazy" e aspect-ratio definido para evitar layout shift

---

### GESTOS MOBILE

- Swipe horizontal: navegar fotos no lightbox
- Swipe down: fechar bottom sheet do jogador
- Pull to refresh: na home (visual apenas, sem lógica de fetch real)
- Long press em foto: feedback haptico visual (escala 0.97 + borda vermelha)

---

### ESTRUTURA DE ARQUIVOS

src/
├── components/
│   ├── TopBar.jsx
│   ├── BottomNav.jsx
│   ├── PlayerCardMobile.jsx
│   ├── BottomSheet.jsx
│   ├── LightboxMobile.jsx
│   ├── VideoCardMobile.jsx
│   └── HorizontalScroll.jsx
├── pages/
│   ├── Home.jsx
│   ├── Players.jsx
│   ├── Photos.jsx
│   └── Videos.jsx
├── styles/
│   └── globals.css
└── App.jsx

---

### DADOS MOCK

Mesmos dados do desktop (pode importar do mesmo arquivo):
- 16 jogadores, 12 fotos, 8 vídeos, 3 notícias

---

### RESTRIÇÕES TÉCNICAS

- React + React Router v6
- CSS Modules ou CSS puro com variáveis
- Sem Tailwind
- Fontes via Google Fonts
- Build para Vercel
- Testar com DevTools em viewport 390x844 (iPhone 14)

---

### QUALIDADE ESPERADA

O resultado deve parecer o app mobile oficial de um clube — não uma versão encolhida do desktop. Gestos fluidos, hierarquia clara em tela pequena, vermelho usado como destaque cirúrgico. A bottom navigation deve ser o centro da experiência de navegação, nunca uma afterthought.
```

---

## DICAS DE USO

1. **Comece pelo Desktop** — use o Prompt 1 primeiro e valide o design e os dados mock
2. **Reuse os dados** — no Prompt 2, peça para importar os mesmos arquivos de dados mock do projeto desktop
3. **Conecte ao Supabase depois** — substitua os dados mock por chamadas à API do Supabase mantendo a mesma estrutura de componentes
4. **Deploy na Vercel** — ambos os projetos funcionam com `vite build` + deploy direto no Vercel sem configuração extra