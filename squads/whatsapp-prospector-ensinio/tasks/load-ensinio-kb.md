# Task: Load Ensinio Knowledge Base

## Task Anatomy
- **task_name:** load-ensinio-kb
- **status:** active
- **responsible_executor:** prospector-chief (Atlas)
- **execution_type:** Worker (checklist-based loading)
- **input:** Ensinio solutions document path (from squad repository `data/ensinio-solutions-kb.md`)
- **output:** Structured KB with 5 pillars ready for cross-reference

## Action Items

### Step 1: Resolve Source Path
1. Source file is located at `squads/whatsapp-prospector-ensinio/data/ensinio-solutions-kb.md`
2. Validate the file exists before proceeding
3. If file not found, HALT with error: "Arquivo nao encontrado em: {path}"

### Step 2: Load and Parse Document
Read the full document and extract the 5 solution pillars with updated structure:

1. **Pilar 1: LMS / Area de Membros (23 features, 1.1-1.23)**
   - Vitrine streaming, cursos, trilhas, comunidade
   - Aulas ao vivo, SCORM, certificados (inclusive MEC)
   - Anamnese, drip content, DRM Social
   - Paginas customizaveis, tema claro/escuro

2. **Pilar 2: Gamificacao (7 features, 2.1-2.7)**
   - 25 gatilhos de gamificacao
   - Sistema de pontos, moedas virtuais, missoes
   - Ranking, loja de recompensas
   - Notificacoes e feedback visual

3. **Pilar 3: Agentes de IA (11 features, 3.1-3.11)**
   - Agente de vendas, tutor, suporte, customizado
   - Multi-canal (WhatsApp, Instagram, Messenger)
   - Qualificacao, follow-up, agendamento automatico
   - Base de conhecimento e integracao com CRM

4. **Pilar 4: Pagamentos Integrados (15 features, 4.1-4.15)**
   - Multi-checkouts, ofertas multiplas
   - PIX, boleto, cartao, parcelamento
   - Split, afiliados, upsell, order bump
   - Cupons, trial, recuperacao de vendas perdidas

5. **Pilar 5: White Label + App + Integracoes (13 features, 5.1-5.13)**
   - Marca propria, dominio customizado
   - App mobile iOS/Android
   - SSO (Google, Entra ID, Okta)
   - API REST, webhooks, Pixel de rastreamento
   - Integracoes com Hotmart, Kiwify, Monetizze, Notazz

### Step 3: Structure Output
Generate a structured KB object with each pillar containing keywords, solutions, descriptions, and feature IDs.

### Step 4: Load into Context
Make the structured KB available for the prospect-analyst agent to cross-reference with prospect needs.

## Acceptance Criteria
- All 5 pillars successfully loaded
- Each pillar contains keywords, solutions, and feature IDs
- Feature count matches expected values (23, 7, 11, 15, 13)
- Keywords section present in each pillar
- Output JSON matches schema defined in Output Example

## Veto Conditions

| Condition | Severity | Resolution |
|-----------|----------|------------|
| KB source file not found | BLOCKING | Verify file exists at `data/ensinio-solutions-kb.md` |
| KB file is empty | BLOCKING | Verify document content and structure |
| Not all 5 pillars detected | WARNING | Document which pillars are missing, proceed with available data |
| Keywords section missing from any pilar | WARNING | Flag for manual review, may reduce cross-reference accuracy |

## Output Example

```json
{
  "kb_version": "2.0",
  "kb_date": "2026-02-19",
  "source_file": "data/ensinio-solutions-kb.md",
  "pillars_count": 5,
  "pillars": {
    "lms": {
      "name": "LMS / Area de Membros",
      "feature_count": 23,
      "feature_range": "1.1-1.23",
      "keywords": ["curso online", "area de membros", "EAD", "treinamento", "comunidade", "certificado"],
      "solutions": ["Vitrine streaming", "Comunidades", "SCORM", "Certificados MEC", "Drip content"],
      "use_cases": ["Infoprodutores", "Empresas com treinamento interno", "Instituicoes de ensino"]
    },
    "gamificacao": {
      "name": "Gamificacao",
      "feature_count": 7,
      "feature_range": "2.1-2.7",
      "keywords": ["gamificacao", "engajamento", "retencao", "pontos", "moedas", "ranking"],
      "solutions": ["25 gatilhos", "Moedas virtuais", "Ranking", "Loja de recompensas", "Missoes"],
      "use_cases": ["Plataformas com baixo engajamento", "Cursos longos", "Comunidades ativas"]
    },
    "ai_agents": {
      "name": "Agentes de IA",
      "feature_count": 11,
      "feature_range": "3.1-3.11",
      "keywords": ["chatbot", "IA", "atendimento automatico", "vendas 24/7", "qualificacao"],
      "solutions": ["Agente de vendas", "Agente tutor", "Multi-canal", "Follow-up", "Agendamento"],
      "use_cases": ["Empresas com alto volume de leads", "Suporte 24h", "Qualificacao automatica"]
    },
    "payments": {
      "name": "Pagamentos Integrados",
      "feature_count": 15,
      "feature_range": "4.1-4.15",
      "keywords": ["checkout", "pagamento", "assinatura", "afiliado", "PIX", "split"],
      "solutions": ["Multi-checkout", "PIX/boleto/cartao", "Split", "Afiliados", "Recuperacao"],
      "use_cases": ["Produtores digitais", "Marketplaces de cursos", "Recorrencia"]
    },
    "whitelabel": {
      "name": "White Label + App + Integracoes",
      "feature_count": 13,
      "feature_range": "5.1-5.13",
      "keywords": ["marca propria", "white label", "app mobile", "SSO", "API", "webhooks"],
      "solutions": ["White label completo", "App iOS/Android", "SSO", "API REST", "Integracoes"],
      "use_cases": ["Empresas com marca propria", "Franquias", "Grandes operacoes"]
    }
  }
}
```

## Error Handling
- **File not found:** HALT, report path and verify repository structure
- **File empty:** HALT, report and verify document was not corrupted
- **Partial parse (< 5 pillars):** WARN which pillars were not found, continue with available data
- **Missing keywords in pillar:** WARN which pillar lacks keywords, flag for manual review
- **Feature count mismatch:** WARN actual vs expected counts, document discrepancy

## Completion Criteria
All 5 pillars loaded with keywords, solutions, and descriptions. KB version tagged with current date. Feature counts validated (23, 7, 11, 15, 13). Ready for cross-referencing with prospect data in downstream analysis tasks.
