# Contribuindo para o AIOS Visual Context System 🤝

Obrigado por considerar contribuir! Este projeto é parte do ecossistema AIOS e segue os mesmos padrões de qualidade e colaboração.

## 🌟 Como Contribuir

### Reportar Bugs 🐛

1. **Verifique se já existe** uma issue similar
2. **Use o template de bug** ao criar nova issue
3. **Inclua informações**:
   - Versão do Claude Code
   - Sistema operacional e versão
   - Versão do AIOS (se aplicável)
   - Steps to reproduce
   - Comportamento esperado vs atual
   - Screenshots se possível

### Sugerir Features ✨

1. **Abra uma issue** com tag `enhancement`
2. **Descreva claramente**:
   - Problema que resolve
   - Solução proposta
   - Alternativas consideradas
   - Contexto adicional

### Pull Requests 🔧

#### Antes de Começar

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Criar branch** descritiva: `feat/emoji-picker` ou `fix/tab-title-bug`
4. **Discutir** mudanças grandes via issue primeiro

#### Durante o Desenvolvimento

```bash
# Setup
git clone https://github.com/SEU_USUARIO/aios-visual-context-system.git
cd aios-visual-context-system
git checkout -b feat/minha-feature

# Fazer mudanças
# Testar localmente

# Commit
git add .
git commit -m "feat: add emoji picker to CLI

- Implements emoji selection interface
- Updates set-title command
- Adds tests

Closes #42"

# Push
git push origin feat/minha-feature
```

#### Checklist antes do PR

- [ ] Código testado localmente
- [ ] Documentação atualizada (README, CHANGELOG)
- [ ] Commit messages seguem [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Código segue o estilo do projeto
- [ ] Sem breaking changes (ou documentado)
- [ ] Screenshots/GIFs se mudança visual

#### Template de PR

```markdown
## Descrição

[Descrição clara do que foi feito]

## Tipo de Mudança

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentação

## Como Testar

1. Instalar a branch
2. Executar comando X
3. Verificar comportamento Y

## Screenshots

[Se aplicável]

## Checklist

- [ ] Código testado localmente
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] Commit messages seguem padrão
```

## 📝 Padrões de Código

### Shell Script

```bash
#!/bin/bash
# Comentário descrevendo o script

set -euo pipefail  # Fail fast

# Variáveis em UPPERCASE
VARIABLE_NAME="value"

# Funções com snake_case
function_name() {
  local param="$1"
  # Implementation
}

# Comments em inglês
# Always quote variables
echo "${VARIABLE_NAME}"
```

### JavaScript/Node.js

```javascript
/**
 * Brief description
 *
 * @param {string} param - Parameter description
 * @returns {Object} Return value description
 */
function camelCaseFunction(param) {
  // Implementation
  return result;
}

// Use strict mode
'use strict';

// Prefer const/let over var
const value = 'immutable';
let mutableValue = 'can change';
```

### Markdown

```markdown
# Title (H1) - Apenas um por arquivo

## Section (H2)

### Subsection (H3)

- Lista
- Itens

**Negrito** para ênfase
`código inline` para comandos

\`\`\`bash
# Blocos de código com syntax highlighting
comando --flag
\`\`\`
```

## 🧪 Testes

### Testar Localmente

```bash
# 1. Copiar arquivos modificados
cp statusline.sh ~/.claude/

# 2. Testar no Claude Code
# Reiniciar e verificar comportamento

# 3. Testar comandos CLI
npx aios-core context set-title "Test" --emoji 🧪

# 4. Verificar diferentes cenários
# - Com/sem AIOS
# - Com/sem emoji
# - Títulos longos
# - Diferentes terminais
```

### Casos de Teste

- ✅ Instalação limpa
- ✅ Update de versão anterior
- ✅ Com e sem AIOS instalado
- ✅ Diferentes terminais (Terminal.app, iTerm2)
- ✅ Diferentes shells (zsh, bash)
- ✅ Títulos muito longos (>50 chars)
- ✅ Caracteres especiais/unicode

## 📚 Documentação

### Atualizar Docs

Se sua mudança afeta:

| Mudança | Atualizar |
|---------|-----------|
| Features novas | README.md, QUICK-START.md |
| Instalação | INSTALL.md |
| Configuração | CUSTOMIZATION.md |
| Versão | CHANGELOG.md, package.json |
| CLI | Help strings, QUICK-START.md |

### Escrever Boa Documentação

- ✅ Exemplos práticos
- ✅ Screenshots quando relevante
- ✅ Linguagem clara e objetiva
- ✅ Casos de uso reais
- ✅ Troubleshooting comum

## 🎯 Áreas para Contribuir

### Fácil (Good First Issue)

- 📝 Melhorar documentação
- 🐛 Corrigir typos
- ✨ Adicionar emojis à tabela de recomendações
- 🎨 Criar temas de cores
- 📸 Adicionar screenshots

### Médio

- 🔧 Adicionar novos formatos de statusline
- 🖥️ Suporte a novos terminais
- 🌐 Traduzir documentação
- ⚙️ Melhorar customização

### Avançado

- 🏗️ Refatorar arquitetura
- 🧪 Adicionar testes automatizados
- 📊 Adicionar métricas
- 🔌 Integração com outros frameworks

## 🔄 Processo de Review

1. **Submeter PR** com descrição clara
2. **CI checks** devem passar
3. **Review** por maintainer
4. **Feedback** e mudanças se necessário
5. **Merge** após aprovação
6. **Release** em próxima versão

## 📞 Comunicação

### Issues

- Use templates quando disponíveis
- Seja específico e objetivo
- Inclua contexto suficiente
- Responda feedback prontamente

### Pull Requests

- Referências issues relacionadas
- Descreva "o que" e "por que"
- Responda comentários de review
- Mantenha escopo focado

### Discord

- Canal: #visual-context-system
- Discussões gerais
- Perguntas rápidas
- Showcase de customizações

## 🏆 Reconhecimento

Contribuidores são listados em:
- README.md (seção Créditos)
- CHANGELOG.md (por versão)
- GitHub Contributors page

## 📄 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma [MIT License](LICENSE) do projeto.

---

**Obrigado por contribuir! 🎉**

Juntos tornamos o AIOS Visual Context System cada vez melhor para toda a comunidade!
