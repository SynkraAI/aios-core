# Ralph Quick Start

🚀 Comece em 2 minutos

## 1️⃣ Ativar Ralph

```bash
@ralph
```

## 2️⃣ Executar um PRD/Story

```bash
*develop docs/prd/my-feature.md yolo
```

Ralph vai:
- ✅ Ler o PRD/Story
- ✅ Encontrar primeira tarefa `[ ]`
- ✅ Delegar para agente especialista (@dev, @qa, @architect, etc)
- ✅ Marcar como `[x]` quando completada
- ✅ Continuar até tudo estar `[x]`

## 3️⃣ Monitorar Progresso

```bash
*status
# → Linha única com estado atual

*report --verbose
# → Relatório detalhado completo
```

## 4️⃣ Retomar se Interrompido

```bash
*resume
# → Continua do ponto exato onde parou
```

## 5️⃣ Configurar (Opcional)

```bash
*config max_iterations 50
*config auto_commit false
*config mode interactive
```

---

## 📋 PRD/Story Format

Ralph funciona com Markdown com checkboxes:

```markdown
# Feature: Algo que precisa ser feito

- [ ] Task 1: Setup ou preparação
- [ ] Task 2: Implementação
- [ ] Task 3: Testes
- [ ] Task 4: Deploy
```

**Importante:** Um checkbox = uma tarefa concreta e testável

---

## 🎯 Modos de Operação

| Modo | Uso |
|------|-----|
| `yolo` | Totalmente autônomo, sem confirmações |
| `interactive` | Pede confirmação antes de cada tarefa |

---

## 📚 Documentação Completa

- **[README.md](README.md)** - Visão geral completa (30 min)
- **[docs/HISTORIA.md](docs/HISTORIA.md)** - Origem, conceito, scripts originais (15 min)
- **[docs/PRATICAS.md](docs/PRATICAS.md)** - Padrões, troubleshooting, casos de uso (20 min)
- **[agents/ralph.md](agents/ralph.md)** - Definição técnica do agente (5 min)

---

## 🔥 Exemplos Rápidos

### Executar feature pequena
```bash
@ralph
*develop docs/prd/simple-feature.md yolo
```

### Executar com supervisão
```bash
@ralph
*develop docs/prd/critical-feature.md interactive
```

### Retomar depois de pausa
```bash
@ralph
*resume
```

### Ver progresso detalhado
```bash
@ralph
*report --verbose
```

---

## ⚡ Core Concepts (TL;DR)

1. **Ralph = Loop autônomo** que executa tarefas até completar
2. **Contexto fresco** em cada iteração (problema resolvido!)
3. **Memória em arquivos**, não em chat
4. **Delega para agente certo** (não faz tudo com um)
5. **Escalável infinitamente** com auto-reset quando contexto pesado

---

## 🚨 Coisas Importantes

- ✅ **DO:** Quebrar tasks em pedaços pequenos (1 coisa = 1 task)
- ✅ **DO:** Ter critério claro de sucesso (testes passam? build ok?)
- ✅ **DO:** Revisar `progress.md` para learnings
- ❌ **DON'T:** Confiar em chat para memória (tudo em arquivos!)
- ❌ **DON'T:** Executar tasks gigantescas (quebra em menores)
- ❌ **DON'T:** Esperar magic (Ralph é inteligente, mas não milagre)

---

## 📞 Precisa de Ajuda?

1. Veja [docs/PRATICAS.md](docs/PRATICAS.md) seção "Troubleshooting"
2. Revise `progress.md` para ver o que deu errado
3. Use `*status` para ver estado atual
4. Verifique `ralph-state.yaml` para debug detalhado

---

**Next:** Leia [README.md](README.md) para entender conceitos mais profundamente

**Version:** 1.0.0 | **Last Updated:** 2025-02-05
