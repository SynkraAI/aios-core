# Enrichment Quality Checklist

## Purpose
Validar a qualidade dos dados enriquecidos coletados pelo instagram-researcher antes de prosseguir para analise e scoring.

## Checklist

### Instagram Data (BLOCKING se todos falharem)
- [ ] **Instagram username extraido** — @username valido a partir da URL
- [ ] **Bio disponivel** — Texto da bio do perfil (pode ser vazio se perfil nao tem bio)
- [ ] **Followers count** — Numero de seguidores (minimo: dado disponivel)
- [ ] **Posts recentes** — Pelo menos 3 posts recentes identificados (ou flag "perfil_privado")

### Site Data (WARNING se falhar)
- [ ] **Site URL identificado** — URL do site da empresa/projeto (da bio ou EXA)
- [ ] **Site summary** — Resumo do que o site oferece (2-3 frases)
- [ ] **Servicos/produtos identificados** — Lista de servicos/produtos oferecidos
- [ ] **Publico-alvo inferido** — Quem e o publico do prospect

### Checkout Data (OPTIONAL — so se checkout_url fornecido)
- [ ] **Checkout URL acessivel** — Pagina responde (HTTP 200)
- [ ] **Plataforma detectada** — Match contra platform-signatures.yaml
- [ ] **Confidence level** — high/medium/low/unknown

### Data Consistency
- [ ] **Nome consistente** — Nome na planilha bate com perfil Instagram
- [ ] **Empresa consistente** — Empresa na planilha bate com site/bio
- [ ] **Dados nao conflitantes** — Sem contradicoes entre fontes

## Scoring

| Resultado | Criterio | Acao |
|-----------|----------|------|
| **PASS** | Instagram data OK + pelo menos 1 dado de site | Prosseguir para analise |
| **PASS_PARTIAL** | Instagram data OK + sem dados de site | Prosseguir com flag `enrichment_partial` |
| **FAIL** | Nenhum dado de Instagram encontrado | Tentar busca alternativa ou flag `enrichment_failed` |

## Notas
- Perfis privados no Instagram sao esperados — marcar como `perfil_privado` e usar bio + followers disponiveis
- Se checkout_url nao foi fornecido, pular toda a secao de Checkout Data
- Se EXA nao retornar resultados, tentar WebFetch direto no site URL antes de marcar como falha
