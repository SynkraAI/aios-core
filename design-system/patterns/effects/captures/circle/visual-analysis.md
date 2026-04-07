# Circle.so — Visual Analysis from Video Frames

## Hero Section (frames 001-005)

### Background
- **Cor base:** Navy profundo (#0A0E27 aprox), NÃO preto puro
- **Gradiente radial:** Centro azul/roxo muito sutil, quase imperceptível
- A iluminação é DIFUSA — não são blobs fortes, é atmospheric lighting

### Arcos/Rings
- São **arcos parciais** (semi-círculos), NÃO circles completos
- Pelo menos 2-3 arcos concêntricos
- Cor: rgba(100,130,255,0.06-0.1) — muito sutis
- Parecem se expandir lentamente (scale animation)
- O arco maior se estende para fora da viewport
- Raio estimado: ~500px, ~700px, ~900px

### Partículas
- Pontos de luz pequenos (2-3px) espalhados pelo hero
- Muito sutis — rgba(180,200,255,0.3-0.6)
- Alguns pulsam (fade in/out)
- Concentração maior perto dos arcos

### Conteúdo Hero
- Badge: ícones de apps (Google, Telegram, App Store, Play) + ★★★★★ + "70k+ reviews"
- Headline: "The complete community platform" — Inter, ~64px, font-weight 700, branco
- Sub: "Build a home for your community, events, and courses — all under your own brand."
- CTA: Email input inline com botão "Start for free" (gradient azul→roxo)

### Logo Bar (parte inferior do hero)
- "Trusted by the world's top communities"
- Logos: Miro, Ali Abdaal, Harvard University, Tim Ferriss, Obama Foundation, Good Inside, Lovable, Mel Robbins
- Logos em branco com opacity ~0.3-0.4

## Seção de Tabs (frame 010)
- Header: "Where all-in-one meets best-in-class"
- Sub: "You don't need another tool. You need a platform to power your vision."
- Tabs: Community, Chat, CRM, Events, Live, Courses, AI Agents, Email Marketing, **Payments** (selected), Website Builder
- Tab selecionada: background pill branco/azul
- Conteúdo: mockup de produto real com 2 painéis (pricing + payment form)

## Receita CSS para recriar os arcos

```css
/* Arc parcial — usar clip-path ou border com overflow hidden */
.arc {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(100,130,255,0.07);
  /* Clipar para mostrar só metade/parte */
  clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 0% 70%);
  /* Ou usar border-top + border-right apenas */
}

/* Alternativa mais simples: border parcial */
.arc-simple {
  position: absolute;
  border-radius: 50%;
  border-top: 1px solid rgba(100,130,255,0.08);
  border-right: 1px solid rgba(100,130,255,0.06);
  border-bottom: 1px solid transparent;
  border-left: 1px solid rgba(100,130,255,0.04);
  transform: rotate(-30deg);
}
```

## Takeaways para o clone
1. Reduzir intensidade do glow — está forte demais no nosso
2. Usar arcos parciais (border parcial) em vez de circles completos
3. Navy profundo como base, não preto
4. Partículas mais sutis (opacity menor)
5. Email form inline (já adicionado)
6. Adicionar seção de tabs interativa com mockups de produto
