# Semáforo Module

> Instruções para classificação de urgência de projetos. Sistema simples de 3 cores.

---

## Cores

| Cor | Significado | Emoji |
|-----|-------------|-------|
| Urgente | Precisa de ação AGORA | 🔴 |
| Atenção | Importante mas pode esperar | 🟡 |
| Tranquilo | No radar, sem pressa | 🟢 |

---

## Heurísticas de Classificação Automática

Usadas quando o projeto é importado (via `/tdah-checklist import`) ou quando a IA sugere reclassificação.

### 🔴 Urgente

O projeto recebe 🔴 se QUALQUER condição for verdadeira:

- Tem pipeline ou sprint ativo (status contém "em produção", "pipeline", "sprint")
- Tem deadline nos próximos 7 dias
- Está bloqueando outro projeto que é urgente
- Tem commits nos últimos 3 dias E status não é "concluído"
- O usuário marcou manualmente como 🔴 no Obsidian

### 🟡 Atenção

O projeto recebe 🟡 se:

- Tem atividade recente (commits nos últimos 14 dias) mas sem sprint ativo
- Tem próximo passo definido mas não iniciado
- Está em progresso (> 0% e < 100%) mas sem momentum forte
- É um projeto novo adicionado sem urgência definida (DEFAULT)

### 🟢 Tranquilo

O projeto recebe 🟢 se:

- É uma ideia sem código (projeto avulso sem `Caminho`)
- Não tem commits > 14 dias e não tem deadline
- Está esperando dependência externa sem previsão
- É um projeto de aprendizado/exploração sem pressão

---

## Override Manual

O usuário pode mover um projeto entre seções no Obsidian (arrastar o bloco H2 de "🔴 Urgente" para "🟢 Tranquilo", por exemplo). A skill SEMPRE respeita a posição atual no arquivo.

A IA pode SUGERIR reclassificação no terminal:

```
💡 claude-remote-manager está como 🔴 mas está bloqueado em review externo.
   Sugestão: mover para 🟡 Atenção até o review sair.
```

Mas NUNCA mover automaticamente. O usuário decide.

---

## Seções no Arquivo Obsidian

A seção H1 determina a classificação:

```markdown
# 🔴 Urgente        ← projetos 🔴
# 🟡 Atenção        ← projetos 🟡
# 🟢 Tranquilo      ← projetos 🟢
# ✅ Concluídos     ← projetos finalizados (sem cor de urgência)
```

Para detectar em qual seção um projeto está: fazer parse do arquivo e verificar sob qual H1 o H2 do projeto aparece.
