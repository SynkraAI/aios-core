<!--
  Tradução: PT-BR
  Original: /docs/en/guides/llm-routing.md
  Última sincronização: 2026-01-26
-->

# Guia de Roteamento de LLM

> 🌐 [EN](../../guides/llm-routing.md) | **PT** | [ES](../../es/guides/llm-routing.md)

---

**Versão:** 1.0.0
**Atualizado:** 2025-12-14

Roteamento de LLM com custo-benefício para Claude Code. Economize até 99% em custos de API mantendo funcionalidade completa.

---

## Visão Geral

O Roteamento de LLM fornece dois comandos para diferentes casos de uso:

| Comando | Provedor | Custo | Caso de Uso |
|---------|----------|-------|-------------|
| `claude-max` | Claude Max (OAuth) | Assinatura | Experiência premium, tarefas complexas |
| `claude-free` | DeepSeek | ~$0.14/M tokens | Desenvolvimento, testes, tarefas simples |

---

## Início Rápido

### Instalação

**Opção 1: Se você tem o aios-core clonado**
```bash
# Do diretório aios-core
node .aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

**Opção 2: Instalação nova**
```bash
# Clone o repositório
git clone https://github.com/SynkraAI/aios-core.git
cd aios-core

# Execute o instalador
node .aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js
```

### Configurar Chave API do DeepSeek

1. Obtenha sua chave API em: <https://platform.deepseek.com/api_keys>
2. Adicione ao arquivo `.env` do seu projeto:

```bash
DEEPSEEK_API_KEY=sk-your-key-here
```

### Uso

```bash
# Experiência Claude premium (usa sua assinatura Claude Max)
claude-max

# Desenvolvimento com custo-benefício (usa DeepSeek ~$0.14/M tokens)
claude-free
```

---

## Comandos

### claude-max

Usa sua assinatura Claude Max via OAuth (login claude.ai).

**Recursos:**
- Capacidades completas do Claude
- Não requer chave API
- Usa login Claude existente
- Melhor para tarefas de raciocínio complexo

**Uso:**
```bash
claude-max
```

**Quando usar:**
- Análise de código complexo
- Decisões arquiteturais
- Tarefas que requerem alta precisão
- Trabalho crítico de produção

---

### claude-free

Usa API DeepSeek com endpoint compatível com Anthropic.

**Recursos:**
- Chamada de ferramentas suportada ✅
- Streaming suportado ✅
- ~99% de redução de custo
- Suporte a arquivo `.env` do projeto

**Uso:**
```bash
claude-free
```

**Quando usar:**
- Desenvolvimento e testes
- Tarefas de código simples
- Aprendizado e experimentação
- Operações de alto volume

---

## Comparação de Custos

| Provedor | Tokens de Entrada | Tokens de Saída | Mensal (1M tokens) |
|----------|-------------------|-----------------|---------------------|
| Claude API | $15.00/M | $75.00/M | $90.00 |
| Claude Max | Incluído | Incluído | $20/mês |
| **DeepSeek** | **$0.07/M** | **$0.14/M** | **$0.21** |

**Economia com DeepSeek:** Até 99.7% comparado à API do Claude

---

## Configuração

### Fontes de Chave API

`claude-free` procura a chave API do DeepSeek nesta ordem:

1. **Arquivo `.env` do projeto** (recomendado)
   ```bash
   # .env na raiz do seu projeto
   DEEPSEEK_API_KEY=sk-your-key-here
   ```

2. **Variável de ambiente**
   ```bash
   # Windows
   setx DEEPSEEK_API_KEY "sk-your-key-here"

   # Unix (adicione ao ~/.bashrc ou ~/.zshrc)
   export DEEPSEEK_API_KEY="sk-your-key-here"
   ```

### Locais de Instalação

| SO | Diretório de Instalação |
|----|-------------------------|
| Windows | `%APPDATA%\npm\` |
| macOS/Linux | `/usr/local/bin/` ou `~/bin/` |

---

## Como Funciona

### claude-max
1. Limpa todas as configurações de provedor alternativo
2. Usa autenticação OAuth padrão do Claude
3. Inicia Claude Code com sua assinatura Max

### claude-free
1. Procura arquivo `.env` (diretório atual → diretórios pai)
2. Carrega `DEEPSEEK_API_KEY` do `.env` ou ambiente
3. Define endpoint compatível com Anthropic do DeepSeek
4. Inicia Claude Code com backend DeepSeek

**Endpoint DeepSeek:**
```text
https://api.deepseek.com/anthropic
```

Este endpoint fornece:
- Compatibilidade com API Anthropic
- Suporte a chamada de ferramentas/funções
- Respostas em streaming

### Nota de Segurança: Bypass de Permissão

Ambos os comandos `claude-max` e `claude-free` usam a flag `--dangerously-skip-permissions` por padrão. Isso:

- **Pula prompts de confirmação** para operações de arquivo, execução de comandos, etc.
- **Deve ser usado apenas em repositórios/ambientes confiáveis**
- **Não é recomendado para codebases não confiáveis**

Um aviso é exibido cada vez que você executa esses comandos. Se preferir confirmações interativas, execute `claude` diretamente em vez de usar os comandos de roteamento.

---

## Solução de Problemas

### Comando não encontrado

**Windows:**
```powershell
# Verifique se npm global está no PATH
echo $env:PATH | Select-String "npm"

# Se não estiver, adicione:
$env:PATH += ";$env:APPDATA\npm"
```

**Unix:**
```bash
# Verifique PATH
echo $PATH | grep -E "(local/bin|~/bin)"

# Se ~/bin não estiver no PATH, adicione ao ~/.bashrc:
export PATH="$HOME/bin:$PATH"
```

### DEEPSEEK_API_KEY não encontrada

1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique o formato da chave: `DEEPSEEK_API_KEY=sk-...`
3. Sem espaços ao redor do `=`
4. Não são necessárias aspas ao redor do valor

### Erros de API

| Erro | Causa | Solução |
|------|-------|---------|
| 401 Unauthorized | Chave API inválida | Verifique a chave no painel DeepSeek |
| 429 Rate Limited | Muitas requisições | Aguarde e tente novamente |
| Connection refused | Problema de rede | Verifique conexão com internet |

### Chamada de ferramentas não funcionando

O endpoint `/anthropic` do DeepSeek suporta chamada de ferramentas. Se as ferramentas não estiverem funcionando:
1. Verifique se o endpoint é `https://api.deepseek.com/anthropic`
2. Verifique se a chave API tem créditos suficientes
3. Tente um teste simples sem ferramentas primeiro

---

## Configuração Avançada

### Modelos Personalizados

Edite os arquivos de template se precisar de modelos diferentes:

**Windows:** `.aios-core/infrastructure/scripts/llm-routing/templates/claude-free.cmd`
**Unix:** `.aios-core/infrastructure/scripts/llm-routing/templates/claude-free.sh`

Altere:
```bash
export ANTHROPIC_MODEL="deepseek-chat"
```

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `ANTHROPIC_BASE_URL` | Endpoint API | `https://api.deepseek.com/anthropic` |
| `ANTHROPIC_API_KEY` | Chave API | De DEEPSEEK_API_KEY |
| `ANTHROPIC_MODEL` | Nome do modelo | `deepseek-chat` |
| `API_TIMEOUT_MS` | Timeout de requisição | `600000` (10 min) |

---

## Desinstalação

### Windows
```powershell
Remove-Item "$env:APPDATA\npm\claude-free.cmd"
Remove-Item "$env:APPDATA\npm\claude-max.cmd"
```

### Unix
```bash
rm /usr/local/bin/claude-free
rm /usr/local/bin/claude-max
# Ou se instalado em ~/bin:
rm ~/bin/claude-free
rm ~/bin/claude-max
```

---

## Recursos Relacionados

- **Definição da Ferramenta:** `.aios-core/infrastructure/tools/cli/llm-routing.yaml`
- **Script de Instalação:** `.aios-core/infrastructure/scripts/llm-routing/install-llm-routing.js`
- **Definição de Tarefa:** `.aios-core/development/tasks/setup-llm-routing.md`
- **API DeepSeek:** <https://platform.deepseek.com/api_keys>

---

## FAQ

**P: O DeepSeek é tão bom quanto o Claude?**
R: O DeepSeek é excelente para a maioria das tarefas de codificação, mas pode não igualar o raciocínio do Claude em problemas complexos. Use `claude-max` para trabalho crítico.

**P: Posso usar ambos os comandos na mesma sessão?**
R: Sim! Cada comando define seu próprio ambiente. Você pode alternar entre eles.

**P: O claude-free funciona offline?**
R: Não, requer acesso à internet para alcançar a API do DeepSeek.

**P: Minhas chaves API estão seguras?**
R: As chaves são carregadas de arquivos `.env` (não faça commit deles!) ou variáveis de ambiente. Nunca codifique chaves diretamente no código.

---

*Gerado pelo AIOS Framework - Story 6.7*
