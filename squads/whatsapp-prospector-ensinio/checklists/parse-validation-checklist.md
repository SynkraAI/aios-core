# Parse Validation Checklist

Quality gate pos-extracao — valida integridade dos dados parseados antes de enviar para analise.

## Integridade do ZIP (BLOCKING)
- [ ] ZIP extraido sem erros
- [ ] Arquivo `_chat.txt` encontrado dentro do ZIP
- [ ] Arquivo `_chat.txt` nao esta vazio (> 0 bytes)
- [ ] Encoding detectado corretamente (UTF-8 ou Latin-1)

## Qualidade do Parsing (BLOCKING)
- [ ] Formato de timestamp detectado (Android BR, iOS BR, etc.)
- [ ] Pelo menos 1 contato valido extraido
- [ ] Pelo menos 10 mensagens nao-sistema parseadas
- [ ] Nenhum contato tem 0 mensagens apos filtragem
- [ ] Ratio mensagens_sistema / total < 80% (se > 80%, export pode estar corrompido)

## Dados dos Contatos (WARNING)
- [ ] Pelo menos 30% dos contatos tem numero de telefone extraido
- [ ] Nomes dos contatos nao contem caracteres estranhos (encoding issue)
- [ ] Nenhum contato duplicado (mesmo numero com nomes diferentes merged)
- [ ] Timestamps em ordem cronologica por contato

## Metadados do Grupo (WARNING)
- [ ] Nome do grupo identificado
- [ ] Data range (inicio/fim) calculado
- [ ] Total de mensagens coerente (diff < 5% entre contagem e soma por contato)

## Filtragem de Sistema (BLOCKING)
- [ ] Mensagens de criptografia filtradas
- [ ] Mensagens "criou o grupo" filtradas
- [ ] Mensagens "adicionou/saiu/removeu" filtradas
- [ ] Mensagens "Midia oculta" filtradas
- [ ] Mensagens "apagou esta mensagem" filtradas

## Scoring
- **BLOCKING items:** Todos devem ser YES para prosseguir
- **WARNING items:** Devem ser reportados mas nao bloqueiam
- **Threshold:** 100% dos BLOCKING items + report de WARNINGs

## On Failure
- Se ZIP corrompido → executar `handle-parse-errors` task
- Se formato nao reconhecido → executar `handle-parse-errors` task
- Se < 10 mensagens validas → HALT, reportar ao usuario que o export pode estar incompleto
