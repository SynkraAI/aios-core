# Session 2026-03-10 (2)

## Projeto
- **Nome:** ensinio
- **INDEX.md:** `docs/projects/ensinio/INDEX.md`

## O que foi feito
1. **Phone Resolution completa (77/77):**
   - Extraiu 230 contatos de 12 screenshots (pedaco_00.png a pedaco_11.png) da lista de membros WhatsApp
   - Match automático nome→telefone: 50 prospects resolvidos via member_list_screenshot
   - 7 prospects com nomes diferentes no chat vs lista: resolvidos via busca manual com quotes únicas
   - Total: 77/77 prospects com telefone (100% coverage)

2. **Google Sheets Pipeline:**
   - `generate-sheets-csv.js` — TSV 12 colunas (Rank, Nome, Score, Tier, etc.)
   - `generate-sheets-paste.js` — TSV 7 colunas (formato padrão da planilha)
   - `generate-apps-script.js` — Gera Apps Script com dados embutidos
   - Outputs: `outreach-google-sheets.tsv`, `outreach-sheets-final.tsv`, `populate-sheet.gs`

3. **Google Workspace MCP OAuth:**
   - Projeto GCP: `claude-code-486320`
   - APIs ativadas: Google Sheets + Google Drive
   - Credenciais OAuth tipo "web" criadas
   - Redirect URI: `http://localhost:3000/oauth/callback`
   - Test user adicionado: `luizfosc@gmail.com`
   - Refresh token obtido via `scripts/oauth-helper.js`
   - MCP configurado em `~/.claude.json` (global + projetos)

4. **Análise Kaizen:**
   - Infraestrutura MCP Google Workspace já existia no framework (`.aios-core/infrastructure/tools/mcp/google-workspace.yaml`)
   - Validators, helpers (parse-sheet-range, format-oauth-scopes), testes já escritos
   - Só faltava ativar credenciais OAuth — melhoria incremental (Pilar 1)

## Agente/Squad em uso
ensinio-whatsapp-prospector + Kaizen

## Arquivos para contexto (próximo Claude DEVE ler)
- `docs/projects/ensinio/INDEX.md`
- `squads/ensinio-whatsapp-prospector/data/phone-books/mentoria-50k.json`
- `squads/ensinio-whatsapp-prospector/tasks/populate-sheet.md`
- `.aios-core/infrastructure/tools/mcp/google-workspace.yaml`

## Decisões tomadas
- Phone resolution via screenshots da lista de membros (não via API)
- 7 prospects sem match automático resolvidos via busca manual no WhatsApp
- Google Sheets: 7 colunas padrão (Nome, Telefone, Grupo, Nicho, Descrição, Mensagem, Link)
- MCP OAuth com credenciais tipo "web" (não service account)
- Refresh token não expira — configuração permanente

## Próximo passo exato
1. Reiniciar Claude Code para carregar MCP Google Workspace
2. Testar: `update_range` na planilha `124EQQAkmt9D7-49LbR-Jx64DhxdtCwceUQgqolk5ZFI`
3. Se MCP funcionar: popular planilha diretamente
4. Se não funcionar: usar Apps Script (`populate-sheet.gs`) como fallback

## Arquivos modificados não commitados
Nenhum — tudo commitado.
