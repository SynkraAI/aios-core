# Fase 0 — Checklist de Infraestrutura

**Data:** 2026-04-08
**Prioridade:** Resolver ANTES de produzir conteúdo
**Objetivo:** Garantir que toda a infraestrutura digital está funcional e alinhada com o novo posicionamento

---

## 1. CRÍTICO — Domínio Principal

### Problema
`www.luizfosc.com.br` está **fora do ar**. Exibe erro do Wix ("domain isn't connected to a website yet"). O site ativo está em `blog.luizfosc.com.br`.

### Ação necessária
- [ ] **Opção A (recomendada):** Redirecionar `www.luizfosc.com.br` → `blog.luizfosc.com.br`
  - Acessar registrador de domínio (onde o .com.br foi comprado)
  - Alterar DNS para apontar para o mesmo servidor do blog
  - Ou criar redirect 301 no registrador
- [ ] **Opção B:** Migrar o blog para o domínio principal
  - Configurar `blog.luizfosc.com.br` como `www.luizfosc.com.br`
  - Redirect 301 do blog → www

### Por que é crítico
Qualquer pessoa que buscar "Luiz Fosc" e clicar no site principal encontra uma página de erro. Isso destrói credibilidade instantaneamente.

---

## 2. CRÍTICO — Links de Redes Sociais no Site

### Problema
Todos os links de redes sociais no footer de `blog.luizfosc.com.br` apontam para `#` (não estão configurados).

### Ação necessária
- [ ] Editar o footer do site e substituir `#` pelos links corretos:
  - Instagram: `https://www.instagram.com/luizfosc/`
  - LinkedIn: `https://www.linkedin.com/in/luizfosc/`
  - YouTube: `https://www.youtube.com/@LuizFosc`
  - Email: `mailto:contato@luizfosc.com.br`

---

## 3. ALTO — URL Legada do YouTube

### Problema
A URL `youtube.com/c/LuizFosc` redireciona para `blog.luizfosc.com.br` em vez do canal do YouTube.

### Ação necessária
- [ ] Verificar configuração de redirect no domínio/DNS
- [ ] A URL funcional correta do canal é: `https://www.youtube.com/@LuizFosc`
- [ ] Usar `youtube.com/@LuizFosc` em todos os materiais, bios e site

---

## 4. ALTO — Atualização de Bios (Novo Posicionamento)

### Instagram — Bio Atual
```
Luiz Felipe Paiva
Palestrante, Ilusionista e Empreendedor
Transformo o impossível em inspiração
Recordista no Guinness World Records
+500 palestras e eventos
```

### Instagram — Bio Proposta
```
Luiz Fosc
Não é dom, é estrutura.
2× Guinness World Records · 500+ palcos
Ensinio · Construtora · Palestra-Show
#pensecomoumilusionista
🔗 [link para linktree/site]
```

**Mudanças:**
- Nome artístico "Luiz Fosc" (não nome completo)
- Tagline central como declaração de posicionamento
- Credenciais verificáveis compactas
- Multi-negócio (reforça "realizador")
- Hashtag do movimento
- Remoção de "Transformo o impossível em inspiração" (genérico demais)

---

### LinkedIn — Headline Atual
```
[Vinculada à Ensinio — sócio fundador / CFO]
```

### LinkedIn — Headline Proposta
```
Não é dom, é estrutura. | 2× Guinness World Records | 500+ palcos | Co-founder Ensinio | #pensecomoumilusionista
```

### LinkedIn — Seção "Sobre" Proposta
```
Você já ouviu alguém dizer que nasceu com um dom?

Eu passei 25 anos desmontando essa ilusão. Cada truque que parece impossível no palco 
foi ensaiado 200 vezes na sala de casa, de madrugada. Cada palestra que arranca 2.000 
pessoas da cadeira foi escrita, reescrita e reconstruída do zero.

Quebrei dois recordes mundiais do Guinness. Não porque sou especial — porque sou 
obcecado por processo.

Hoje combino ilusionismo profissional com conteúdo de negócios em um formato que 
ninguém mais faz: a palestra-show. Mais de 500 palcos. Clientes como Ambev, Bradesco, 
Petrobras, Coca-Cola, Globo. Premiado com o Top of Mind International em Londres 
(Inovação e Impacto Criativo).

Além do palco: co-fundador e CFO da Ensinio (edtech/fintech, valuation R$48M), 
15 anos à frente de uma construtora, investidor de startups.

Não é dom. É estrutura.

📩 contato@luizfosc.com.br
📱 (31) 99262-3752
```

---

### YouTube — Descrição Atual
> "Sou o Luiz Fosc, um realizador movido pela curiosidade..."

### YouTube — Ajustes Propostos
- [ ] Adicionar como primeira linha: **"Não é dom, é estrutura. #pensecomoumilusionista"**
- [ ] Manter o texto atual (já está bom e alinhado com o tom de "realizador")
- [ ] Corrigir links na seção de links do canal (usar URL correta do site)
- [ ] Adicionar links: Instagram, LinkedIn, Site

---

## 5. MÉDIO — Melhorias no Site

- [ ] Adicionar seção de **depoimentos** (existia no site Wix antigo)
  - Sugestão: 3-5 depoimentos de organizadores de eventos
- [ ] Adicionar seção de **mídia/imprensa** com clippings
  - Gazeta RJ, FIEMG, Jornal Joca, Revista Influencer, Festival Internacional de Mágica
- [ ] Criar **media kit para download** (PDF com bio, fotos, números, rider técnico)
- [ ] Alinhar messaging do formulário de contato com o site (menciona "Mentorias" que não aparecem no site)

---

## 6. MÉDIO — Branding Visual dos Canais

- [ ] **YouTube:** Atualizar banner do canal com identidade visual atual (dark + dourado)
- [ ] **Instagram:** Criar destaques (highlights) organizados:
  - 🎯 Palestras (trechos e bastidores)
  - 🏆 Guinness (a história dos recordes)
  - 📰 Mídia (aparições em imprensa)
  - 🎬 Bastidores (processo de criação)
  - 💬 Depoimentos (feedback de clientes)
- [ ] **LinkedIn:** Atualizar banner com identidade visual

---

## Ordem de Execução Recomendada

| Prioridade | Item | Tempo estimado | Quem |
|---|---|---|---|
| 1 | Resolver domínio www.luizfosc.com.br | 30min | Fosc (acesso ao registrador) |
| 2 | Corrigir links do footer no site | 15min | Fosc (acesso ao CMS) |
| 3 | Corrigir URL do YouTube nos materiais | 10min | Fosc |
| 4 | Atualizar bio do Instagram | 10min | Fosc |
| 5 | Atualizar headline e "Sobre" do LinkedIn | 20min | Fosc |
| 6 | Ajustar descrição e links do YouTube | 15min | Fosc |
| 7 | Criar destaques do Instagram | 1-2h | Fosc + assets |
| 8 | Atualizar banners (YT, LI) | 1h | Design (pode usar design system) |
| 9 | Seção de depoimentos no site | 1h | Fosc (acesso ao CMS) |
| 10 | Media kit | 2-3h | Nós podemos gerar |

**Tempo total estimado:** ~6-8h para resolver tudo

---

*Checklist gerado em 2026-04-08 — Projeto LUIZFOSC*
