# 🧪 Guia Rápido para Testadores macOS - AIOS v4.31.1

## 👋 Bem-vindo, Testador!

Você foi convidado para testar uma nova funcionalidade do AIOS-FULLSTACK v4.31.1 no macOS.

**Tempo necessário**: ~15-20 minutos
**O que você vai testar**: Sistema de detecção de instalação via NPX
**Por que é importante**: Garante que usuários macOS recebam ajuda clara quando instalarem incorretamente

---

## 🚀 Acesso Rápido

### 📄 Instruções Completas de Teste
**Link direto**: `docs/TESTING-INSTRUCTIONS-MACOS-v4.31.1.md`

**Ou no GitHub**:
https://github.com/Pedrovaleriolopez/aios-fullstack/blob/main/docs/TESTING-INSTRUCTIONS-MACOS-v4.31.1.md

### 📚 Documentação de Referência
- **Guia do Usuário NPX**: `docs/npx-install.md`
- **CHANGELOG**: `CHANGELOG.md` (veja seção v4.31.1)
- **Story Original**: `docs/stories/2.3-npx-macos-help-improvement.yaml` (no repo AIOS-V4)

---

## ⚡ Instalação Rápida (3 comandos)

**Teste 1 - Deve FALHAR com mensagem de ajuda**:
```bash
cd ~
npx aios-fullstack install
# Espere ver: ⚠️ NPX Temporary Directory Detected
```

**Teste 2 - Deve FUNCIONAR normalmente**:
```bash
mkdir -p ~/test-aios-v4.31.1 && cd ~/test-aios-v4.31.1
npx aios-fullstack install
# Deve iniciar instalador interativo
```

**Teste 3 - Comportamento variável**:
```bash
cd /tmp
npx aios-fullstack install
# Observe o que acontece
```

---

## ✅ O Que Validar

### Teste 1 (Execução Incorreta):
- [ ] Mensagem de erro apareceu?
- [ ] Está clara e útil?
- [ ] Tem cores/formatação adequada?

### Teste 2 (Execução Correta):
- [ ] Instalador normal iniciou?
- [ ] Sem mensagem de erro?
- [ ] Funciona como esperado?

### Teste 3 (Edge Case):
- [ ] Anotar comportamento observado

---

## 📋 Template de Relatório Rápido

```markdown
**Testador**: [Seu Nome]
**macOS**: [versão]
**Data**: [hoje]

### Resultado:
- Teste 1: ✅ PASS / ❌ FAIL
- Teste 2: ✅ PASS / ❌ FAIL
- Teste 3: [descrever]

### Feedback:
- Mensagem clara? [sim/não]
- Sugestões: [texto]

### Aprovação:
- [ ] APROVADO para produção
- [ ] NECESSITA AJUSTES
```

---

## 📤 Como Reportar Resultados

**Opção 1 - GitHub Issue** (preferido):
1. Vá para: https://github.com/Pedrovaleriolopez/aios-fullstack/issues/new
2. Título: `[Test] Story 2.3 Results - [Seu Nome]`
3. Cole o relatório

**Opção 2 - Email/Slack**:
Envie para o coordenador do projeto

---

## 🆘 Precisa de Ajuda?

- **Instruções completas**: Veja `TESTING-INSTRUCTIONS-MACOS-v4.31.1.md`
- **Problemas técnicos**: Abra issue no GitHub
- **Dúvidas**: Pergunte ao coordenador

---

## 🎯 Critério de Sucesso

**Story 2.3 será aprovado se**:
- 2 testadores macOS independentes validarem
- Teste 1 aprovado por ambos (erro claro)
- Teste 2 aprovado por ambos (funciona normal)
- Feedback positivo sobre clareza da mensagem

---

**Obrigado por contribuir! 🙌**

*AIOS-FULLSTACK v4.31.1 - Story 2.3*
