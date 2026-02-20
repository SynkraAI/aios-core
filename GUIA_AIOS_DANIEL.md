# 🚀 Fluxo de Trabalho Automático com AIOS e Gemini CLI

Um guia definitivo criado especificamente para você, Daniel, para dominar seu ecossistema AIOS diretamente do terminal.

## 🧠 O que é o AIOS?
O **AIOS (Artificial Intelligence Operating System)** funciona como o seu "cérebro" central de agentes de IA. Ele não é apenas um simples script, mas um ecossistema que transforma qualquer diretório vazio em um ambiente de desenvolvimento impulsionado por múltiplos agentes especialistas (Desenvolvedor, Arquiteto, QA, DevOps, etc.).

**O que isso significa na prática?** 
Significa que você tem uma equipe completa de especialistas em software "morando" no seu terminal. Em vez de abrir o navegador, gerenciar abas e copiar/colar código, você delega tarefas complexas diretamente pela linha de comando, mantendo o foco total na sua IDE e no código.

---

## ⚙️ A Mágica da Automação (Tudo pelo Terminal)

Você introduziu dois superpoderes ao seu ambiente global: os comandos `aios-new` e `gemini-aios`. A combinação deles é o que cria o seu "ponto automático de trabalho".

### 1. Criando um Novo Projeto AIOS (`aios-new`)
Sempre que for começar uma nova ideia ou repo, esqueça ter que configurar o Gemini ou prompt de agentes manualmente. De qualquer lugar no terminal, role:

```bash
aios-new nome-do-meu-projeto
```

**O que este comando faz automaticamente por você em 1 segundo:**
1. **Andaime (Scaffolding):** Cria a pasta do projeto.
2. **Importação de Cérebro:** Copia o núcleo do AIOS (regras, prompts comportamentais e inteligência dos agentes) da sua source principal para a nova pasta (via `.gemini/` e `.aios-core/`).
3. **Mapeamento de Comandos:** Cria os atalhos mágicos (slash commands) para o Gemini CLI (como `/aios-dev`, `/aios-menu`).
4. **Git & Env:** Inicia o repositório Git, cria o arquivo `.gitignore` adequado e um `.env` em branco aguardando sua API Key.

### 2. Ativando seu Ambiente com IA (`gemini-aios`)
Após dar o `aios-new`, entre no diretório criado:

```bash
cd nome-do-meu-projeto
```
*(Certifique-se de que a varável de ambiente `GOOGLE_AI_API_KEY` esteja presente no arquivo `.env` ou globalmente no seu `~/.zshrc`).*

Agora, ative sua força de trabalho:

```bash
gemini-aios
```

**O que o `gemini-aios` faz sob o capô?**
- Verifica dinamicamente se você tem uma chave de API válida.
- Inicia o **Gemini CLI** forçando inteligentemente o uso do modelo `gemini-2.0-flash`. O modelo Flash processa contextos gigantes (arquivos e mais arquivos de código) de forma extremamente mais rápida e barata/gratuita do que o Pro.
- Alerta os comandos disponíveis daquele diretório, deixando o terminal pronto para receber comandos.

---

## 🤖 Como Usar a Mágica no Dia a Dia

Uma vez dentro do prompt do `gemini-aios` (que no seu CLI será algo como `> `), você não está falando apenas com uma IA genérica, você tem controle de roteamento. Invoque especialistas usando os Slash Commands inseridos pelo seu setup:

- `/aios-menu` ➡️ Lista quem está disponível na sua "empresa" para trabalhar.
- `/aios-architect ` ➡️ **Primeiro passo ideal.** Peça algo como: *"Como devo estruturar o banco de dados desse app de lista de tarefas em Node.js considerando escalabilidade?"*
- `/aios-dev` ➡️ **A mão na massa.** Peça: *"Tendo em vista a estrutura definida, implemente o arquivo server.js agora."*
- Outros perfis como `/aios-qa` para testes e validações.

### Exemplo de Fluxo Absoluto (Resumo):
```bash
# De qualquer lugar do seu Mac:
aios-new meu-sistema-vendas
cd meu-sistema-vendas
gemini-aios

# Agora, dentro do Gemini CLI:
> /aios-dev Verifique meu diretório atual e inicialize um projeto Node.js com Express básico. 
# (Ele faz tudo direto no terminal)
```

---

## 🎯 Por que seu Setup é um Absoluto "Ponto Automático"?

1. **Repetibilidade Instantânea:** O `aios-new` te blinda de perder 10 minutos copiando e colando prompts em todo novo repositório. O projeto já nasce inteligente.
2. **Contexto Ciente:** Os agentes (como o `/aios-dev`) foram projetados via `.gemini/rules.md` e metadados para ler seu disco rígido e saber imediatamente em qual projeto estão trabalhando sem que você precise explicar nada.
3. **Escudo de Custos:** O wrapper `gemini-aios` já te blinda de enviar milhares de tokens (os arquivos de código) para um modelo caro. O default no Flash permite iteração rápida sem pesar no limite de quota ou no bolso de sua Cloud.

Seja bem-vindo ao futuro do seu fluxo de trabalho, Daniel! Escreva código através de comandos executivos, construindo do zero à produção pelo seu Mac!
