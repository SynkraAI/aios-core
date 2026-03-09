---
task: Ensinio Setup
responsavel: gui-avila
model: sonnet
elicit: true
sla:
  target: 15-25 min
  max: 35 min
  description: "Setup guiado de escola online com Ensinio — personalizado para contexto do criador"
Entrada: |
  - expertise: Área de conhecimento do criador
  - audience: Público-alvo (quem vai comprar)
  - content_ready: Já tem conteúdo gravado? (sim/não/parcial)
  - monetization: Modelo de monetização desejado (curso, assinatura, comunidade)
  - brand: Tem marca própria? (nome, cores, logo)
Saida: |
  - school_architecture: Estrutura da escola (cursos, módulos, aulas)
  - monetization_plan: Plano de monetização usando 4 Níveis de Entrega
  - setup_checklist: Passo-a-passo de configuração no Ensinio
  - launch_roadmap: Roadmap de lançamento (pré-lançamento → lançamento → pós)
veto_conditions:
  input:
    - "Sem expertise definida → ASK: 'O que você sabe fazer que os outros pagam para aprender?'"
    - "Sem público-alvo → ASK: 'Quem é a pessoa que mais precisa do que você ensina?'"
  process:
    - "Criador quer fazer TUDO antes de lançar → CORRECT: 'Lança com 1 módulo. Valida antes de gravar tudo.'"
    - "Preço abaixo de R$47 para curso → WARN: 'Subvaloriza seu trabalho. Repensar precificação.'"
    - "Plataforma não white-label → CORRECT: 'Ensinio é white-label. Sua marca, seus dados, seu domínio.'"
  output:
    - "Escola sem funil de vendas → WARN: 'Conteúdo sem captura de lead = dinheiro na mesa'"
    - "Apenas 1 nível de entrega → WARN: 'Monetiza o mesmo conhecimento em 4 faixas de preço'"
---

# *ensinio-setup

Guiar criação de escola online completa usando Ensinio (plataforma white-label).

## When to Use

- Criador de conteúdo quer monetizar conhecimento com escola própria
- Profissional quer escalar expertise com cursos online
- Empresa quer treinar equipe com plataforma própria
- Migração de outra plataforma (Hotmart, Kiwify) para white-label

## Workflow

### Step 1: Elicitation — Entender o Criador

1. **"O que você sabe fazer que outros pagam para aprender?"** — Expertise core
2. **"Quem é a pessoa que mais precisa disso?"** — ICP (ideal customer profile)
3. **"Já tem conteúdo gravado?"** → Sim: organizar; Não: planejar; Parcial: priorizar
4. **"Como quer monetizar?"** → Curso avulso, assinatura, comunidade, mentoria
5. **"Tem marca própria?"** → Nome, cores, domínio

### Step 2: Aplicar 4 Níveis de Entrega

Monetizar o MESMO conhecimento em 4 faixas:

```
Nível 1: EU TE ENSINO (Grátis)
  → YouTube, Instagram, Blog
  → Objetivo: Capturar leads, construir autoridade

Nível 2: JEITO FÁCIL/RÁPIDO (R$47-597)
  → Curso online no Ensinio
  → Objetivo: Monetização escalável, receita recorrente

Nível 3: FAÇO COM VOCÊ (R$1.500-5.000)
  → Mentoria em grupo ou individual
  → Objetivo: Alto ticket, resultado garantido

Nível 4: FAÇO PARA VOCÊ (R$5.000-30.000+)
  → Consultoria / Done-for-you
  → Objetivo: Premium, poucos clientes, máximo valor
```

### Step 3: Arquitetura da Escola

Desenhar estrutura no Ensinio:

```
ESCOLA: [Nome da marca]
├── Curso Principal (Nível 2)
│   ├── Módulo 1: Fundamentos (3-5 aulas)
│   ├── Módulo 2: Implementação (5-8 aulas)
│   ├── Módulo 3: Avançado (3-5 aulas)
│   └── Módulo Bônus: Templates/Ferramentas
│
├── Mentoria (Nível 3) — opcional
│   ├── Acesso ao curso + calls semanais
│   └── Grupo exclusivo
│
├── Comunidade — opcional
│   └── Fórum, networking, suporte
│
└── Landing Page (captura)
    └── Lead magnet → Funil → Oferta
```

### Step 4: Setup no Ensinio

Passo-a-passo:
1. Criar conta em ensinio.com
2. Configurar marca (nome, logo, cores, domínio custom)
3. Criar primeiro curso com 1 módulo (3 aulas mínimo)
4. Configurar página de vendas
5. Integrar pagamento (Stripe, PagSeguro, etc.)
6. Configurar certificado automático
7. Testar com 1 aluno real (validar antes de lançar!)

### Step 5: Roadmap de Lançamento

```
PRÉ-LANÇAMENTO (2-4 semanas):
- Gravar módulo 1 completo
- Criar landing page de espera
- Coletar leads com conteúdo gratuito (Nível 1)
- 3 posts/vídeos de aquecimento

LANÇAMENTO (1 semana):
- Oferta especial de fundador
- Escassez real (primeiros 50 alunos)
- Email + WhatsApp + Social

PÓS-LANÇAMENTO:
- Coletar feedback do módulo 1
- Gravar módulos 2-3 com base no feedback
- Ativar funil perpétuo (evergreen)
```

## Output Example

```
🎓 Escola Online — [Marca]

Cara, olha só como ficou a estrutura:

ESCOLA: Academia de Automação
├── Curso: Automações PRO (R$297)
│   ├── Módulo 1: Fundamentos de No-Code (5 aulas)
│   ├── Módulo 2: Make.com na Prática (8 aulas)
│   └── Módulo 3: Agentes de IA (5 aulas)
│
├── Mentoria: Grupo VIP (R$2.500/trimestre)
│   └── Calls semanais + acesso curso + suporte
│
└── Conteúdo Grátis: YouTube + Lead Magnet

4 NÍVEIS DE ENTREGA:
1. Grátis → YouTube (autoridade)
2. R$297 → Curso Ensinio (escala)
3. R$2.500 → Mentoria grupo (resultado)
4. R$10.000 → Consultoria 1:1 (premium)

PRÓXIMOS PASSOS:
1. HOJE: Criar conta Ensinio + definir nome da escola
2. SEMANA 1: Gravar 3 aulas do Módulo 1
3. SEMANA 2: Configurar página de vendas + pagamento
4. SEMANA 3: Lançar para lista de espera (primeiros 20 alunos)

Beleza? Bora montar! 😊
```

## Inline Checklist

- [ ] Expertise do criador clara e validada
- [ ] ICP definido (quem compra)
- [ ] 4 Níveis de Entrega mapeados
- [ ] Estrutura da escola desenhada (cursos, módulos, aulas)
- [ ] Setup passo-a-passo fornecido
- [ ] Roadmap de lançamento com datas
- [ ] Funil de vendas planejado (captura → oferta)
- [ ] Validação com 1 aluno/módulo antes de lançar tudo

## Related

- **Agent:** gui-avila (T0)
- **Next Tasks:** automation-diagnostic, chatbot-setup
- **Reference:** Ensinio platform, história "Ensinio nasceu da mágica online"
