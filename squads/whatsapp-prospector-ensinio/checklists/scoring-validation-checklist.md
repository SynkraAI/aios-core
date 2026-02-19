# Scoring Validation Checklist

Quality gate para fase de scoring/analise (QG-002.5).
Executado pelo prospector-chief apos prospect-analyst completar a analise.

---

## BLOCKING Checks (falha = HALT pipeline)

- [ ] **Coverage completa:** Todos os contatos com mensagens significativas foram analisados
- [ ] **Scoring presente:** Todo prospect analisado tem temperature_score entre 1 e 10
- [ ] **Classificacao presente:** Todo prospect tem prospect_type definido (potential_client OU partner)
- [ ] **Prospects qualificados existem:** Pelo menos 1 prospect com score >= 3
- [ ] **Pillar mapping presente:** Todo potential_client tem pelo menos 1 matching_pillar

## WARNING Checks (log e continuar)

- [ ] **Distribuicao de scores:** Scores NAO sao uniformes (variancia > 0)
- [ ] **Score justificado:** Todo prospect tem analysis_notes explicando o score
- [ ] **Temporal context:** Todo prospect tem temporal_context preenchido
- [ ] **Pain points documentados:** Todo potential_client com score >= 5 tem pelo menos 1 pain_point
- [ ] **Phone coverage:** >= 80% dos prospects qualificados tem telefone

## Sanity Checks (informacional)

- [ ] **Distribuicao esperada:** Prospects quentes (8-10) sao < 30% do total
- [ ] **Partner ratio:** Partners sao < 40% do total de qualificados
- [ ] **Low data flag:** Contatos com < 3 mensagens tem flag de low_data
- [ ] **Pillar diversity:** Pelo menos 2 pilares diferentes representados nos matches
- [ ] **Project names unicos:** Cada prospect tem project_name distinto (sem duplicatas)

---

## Metricas de Qualidade

```json
{
  "total_contacts_analyzed": 0,
  "total_qualified": 0,
  "qualification_rate": "0%",
  "score_distribution": {
    "hot_8_10": 0,
    "warm_5_7": 0,
    "cool_3_4": 0,
    "rejected_1_2": 0
  },
  "type_distribution": {
    "potential_client": 0,
    "partner": 0
  },
  "pillar_distribution": {
    "1_lms": 0,
    "2_gamificacao": 0,
    "3_ai_agents": 0,
    "4_payments": 0,
    "5_whitelabel": 0
  },
  "phone_coverage": "0%",
  "avg_score": 0,
  "median_score": 0
}
```

## Resultado

| Status | Condicao |
|--------|----------|
| **PASS** | Todos BLOCKING checks passam, <= 1 WARNING |
| **PASS_WITH_WARNINGS** | Todos BLOCKING passam, > 1 WARNING |
| **FAIL** | Qualquer BLOCKING check falha |

## Acao pos-checklist

- **PASS:** Continuar para phase-4-write (outreach)
- **PASS_WITH_WARNINGS:** Continuar com log das warnings para review
- **FAIL:** HALT pipeline, reportar ao usuario com diagnostico
