# Session 2026-03-12

## Projeto
- **Nome:** Ensinio
- **INDEX.md:** `docs/projects/ensinio/INDEX.md`

## O que foi feito
1. **Pesquisa API GoHighLevel v2**: investigou endpoints de opportunities, contacts e conversations. Confirmou que é possível criar deals, contatos e enviar mensagens via API.
2. **Teste de autenticação**: primeira API key (pit-28ac...) retornou 401 (scopes insuficientes). Segunda key (pit-2fd8...) funcionou após configurar scopes corretos.
3. **LocationId descoberto**: `Sol1tg48smyynNGg4PNY` — necessário para todas as chamadas.
4. **Mapeamento de pipelines**: 10 pipelines listados. Pipeline "Qualificação" (`xRqrV2LoT6E8iwLW4Syi`) escolhido como target, stage "Para prospectar" (`d3c25373-...`).
5. **13.602 contatos** existentes na base GHL validados.
6. **`.env` criado** em `squads/ensinio-whatsapp-prospector/.env` com todas as credenciais.
7. **Squad v4.0.0**: nova fase GHL Sync adicionada ao pipeline (phase-5), entre outreach validation e Google Sheets.
8. **Tag prompt interativo**: SEMPRE pergunta ao usuário qual tag aplicar (default: "Leads Fosc").
9. **Task sync-to-ghl.md**: fluxo completo (contact → deal → message) com rate limiting, deduplicação e error handling.
10. **QG-005**: novo quality gate + checklist para validação do sync GHL.
11. **Phone resolution melhorada**: imagens SEMPRE primeiro (CleanShot split com `magick -crop x1080`), manual só como último recurso para residuais.

## Agente/Squad em uso
ensinio-whatsapp-prospector v4.0.0 (Atlas - prospector-chief)

## Arquivos para contexto (próximo Claude DEVE ler)
- `squads/ensinio-whatsapp-prospector/config.yaml`
- `squads/ensinio-whatsapp-prospector/workflows/full-pipeline.yaml`
- `squads/ensinio-whatsapp-prospector/tasks/sync-to-ghl.md`
- `squads/ensinio-whatsapp-prospector/tasks/resolve-phone-numbers.md`
- `squads/ensinio-whatsapp-prospector/.env`
- `docs/projects/ensinio/INDEX.md`

## Decisões tomadas
- Pipeline "Qualificação" como target para deals (stage "Para prospectar")
- Tags default "Leads Fosc" com prompt interativo obrigatório
- Envio de mensagens via `POST /conversations/messages` (requer template WhatsApp aprovado pela Meta para primeira mensagem fria)
- Rate limit: 600ms entre requests (~100/min)
- Ordem de phone resolution: phone-book → imagens → manual (residuais)

## Próximo passo exato
1. Rodar `*full-pipeline` com um grupo de WhatsApp real para testar o fluxo GHL completo
2. Verificar se precisa de template WhatsApp aprovado na Meta para envio de mensagens frias
3. Popular Google Sheets via MCP (campanha mentoria-50k pendente)

## Arquivos modificados não commitados
Nenhum — tudo commitado (commit `00e29ecf9`).
