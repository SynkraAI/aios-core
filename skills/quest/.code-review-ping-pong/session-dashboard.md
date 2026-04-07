# Ping-Pong Session — Dashboard Server

## Scope
- files:
  - dashboard/server.js

## Goals
- Error handling: todas as operações de I/O têm try/catch adequado?
- YAML parsing: fallback parser trata edge cases (multi-line, anchors, nesting)?
- Security: CORS, WebSocket sem auth, path traversal em endpoints
- Registry: writeRegistry usa template manual — quebra com caracteres especiais?
- File watching: debounce funciona? Polling fallback é robusto?
- Idempotência: checagem de porta já em uso funciona em todos os cenários?
- Scan paths: rebuildRegistry não inclui diretórios proibidos (ex: aios-core/packages)?
- Theme validation: lista hardcoded — deveria ser dinâmica?
- API responses: consistência de formato (JSON vs raw YAML)
- Graceful shutdown: watchers e WebSocket são fechados corretamente?

## Constraints
- Não alterar a arquitetura HTTP+WebSocket
- Não adicionar dependências externas
- Manter compatibilidade com o frontend existente
- Servidor é local-only (desenvolvimento) — não adicionar auth complexa

## Known Issues to Verify
- writeRegistry usa template string manual (não js-yaml.dump)
- serveProject retorna text/yaml mas serveProjects embute YAML em JSON
- rebuildRegistry inclui ~/aios-core/packages (proibido pelo CLAUDE.md global)
- YAML parser simples pode mascarar dados corrompidos como "projeto vazio"
- loadPackData carrega do disco a cada request (sem cache persistente)
