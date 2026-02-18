# 🎬 Multi-Chat Orchestration: {{epic_name}}

**Epic ID:** {{epic_id}}
**Stories:** {{stories_count}}
**Waves:** {{waves_count}}
**Gerado em:** {{generation_date}}

---

## 📋 Epic Overview

**Nome:** {{epic_name}}
**Descrição:** {{epic_description}}
**Stories incluídas:** {{stories_count}}

### Stories por Wave

{{#waves}}
**Wave {{wave_number}}:** {{stories_in_wave}} stories
{{/waves}}

---

## 🚀 Execution Strategy

**Modelo:** 1 SM Coordenador + {{dev_count}} Devs em paralelo

**Timeline estimada:**
- Wave 1: {{wave1_duration}}
- Wave 2: {{wave2_duration}}
- Wave 3: {{wave3_duration}}
- **Total:** {{total_duration}}

---

## 💻 CHAT 1: Coordenador (@sm)

**Role:** Coordena execução, valida stories, gerencia dependencies

**Prompt para copiar:**

```
@sm

Você é o coordenador deste epic multi-chat.

**Epic:** {{epic_id}} — {{epic_name}}

**Sua responsabilidade:**
1. Validar que todas as stories estão claras
2. Coordenar execução das 3 waves
3. Resolver conflitos de merge
4. Validar completion de cada wave antes de prosseguir

**Stories neste epic:**
{{#stories}}
- {{story_id}}: {{story_title}}
{{/stories}}

**Waves planejadas:**
{{#waves}}
**Wave {{wave_number}}:**
{{#stories_in_wave}}
  - {{story_id}} (Chat {{chat_number}})
{{/stories_in_wave}}
{{/waves}}

**Seus comandos:**
- *draft — Para criar/validar stories se necessário
- *validate-story-draft — Para validar stories antes de delegar
- *track-progress — Para acompanhar progresso

**Workflow:**
1. Valide todas as stories listadas acima
2. Quando Chat 2, 3, 4 reportarem conclusão da Wave 1, valide
3. Libere Wave 2
4. Repita para Wave 3
5. Faça merge final quando tudo estiver pronto

Pronto para começar?
```

---

## 💻 CHAT 2: Dev Wave 1

**Role:** Desenvolve stories da Wave 1

**Prompt para copiar:**

```
@dev

Você faz parte de uma execução multi-chat do epic {{epic_id}}.

**Suas stories (Wave 1):**
{{#wave1_chat2_stories}}
- {{story_id}}: {{story_title}}
  Path: docs/stories/{{story_file}}
{{/wave1_chat2_stories}}

**Workflow:**
1. Leia cada story completa
2. Execute *develop para cada uma
3. Rode testes
4. Reporte conclusão ao Chat 1 (Coordenador)

**IMPORTANTE:**
- NÃO faça merge ainda (Coordenador fará isso)
- NÃO comece Wave 2 até coordenador liberar
- Se houver conflitos, reporte ao Coordenador

Pronto para começar Wave 1?
```

---

## 💻 CHAT 3: Dev Wave 2

**Role:** Desenvolve stories da Wave 2

**Prompt para copiar:**

```
@dev

Você faz parte de uma execução multi-chat do epic {{epic_id}}.

**Suas stories (Wave 2):**
{{#wave2_chat3_stories}}
- {{story_id}}: {{story_title}}
  Path: docs/stories/{{story_file}}
{{/wave2_chat3_stories}}

**Workflow:**
1. AGUARDE liberação do Coordenador (Chat 1)
2. Quando liberado, leia cada story completa
3. Execute *develop para cada uma
4. Rode testes
5. Reporte conclusão ao Chat 1

**IMPORTANTE:**
- NÃO comece antes da liberação do Coordenador
- NÃO faça merge (Coordenador fará isso)
- Se houver conflitos, reporte ao Coordenador

Aguardando liberação da Wave 2...
```

---

## 💻 CHAT 4: Dev Wave 3

**Role:** Desenvolve stories da Wave 3

**Prompt para copiar:**

```
@dev

Você faz parte de uma execução multi-chat do epic {{epic_id}}.

**Suas stories (Wave 3):**
{{#wave3_chat4_stories}}
- {{story_id}}: {{story_title}}
  Path: docs/stories/{{story_file}}
{{/wave3_chat4_stories}}

**Workflow:**
1. AGUARDE liberação do Coordenador (Chat 1)
2. Quando liberado, leia cada story completa
3. Execute *develop para cada uma
4. Rode testes
5. Reporte conclusão ao Chat 1

**IMPORTANTE:**
- NÃO comece antes da liberação do Coordenador
- NÃO faça merge (Coordenador fará isso)
- Se houver conflitos, reporte ao Coordenador

Aguardando liberação da Wave 3...
```

---

## 📊 Progress Tracking

| Wave | Chat | Stories | Status | Completado em |
|------|------|---------|--------|---------------|
| 1 | 2 | {{wave1_chat2_count}} | ⏳ | — |
| 1 | 3 | {{wave1_chat3_count}} | ⏳ | — |
| 2 | 2 | {{wave2_chat2_count}} | ⏳ | — |
| 2 | 4 | {{wave2_chat4_count}} | ⏳ | — |
| 3 | 3 | {{wave3_chat3_count}} | ⏳ | — |
| 3 | 4 | {{wave3_chat4_count}} | ⏳ | — |

---

## ✅ Execution Checklist

- [ ] Copiar prompts para cada chat
- [ ] Chat 1 (SM) valida todas as stories
- [ ] Chat 2 e 3 executam Wave 1
- [ ] Chat 1 valida Wave 1
- [ ] Chat 2 e 4 executam Wave 2
- [ ] Chat 1 valida Wave 2
- [ ] Chat 3 e 4 executam Wave 3
- [ ] Chat 1 valida Wave 3
- [ ] Chat 1 faz merge final
- [ ] QA review completo

---

**Gerado automaticamente por Navigator Agent 🧭**
**Epic:** {{epic_id}}
