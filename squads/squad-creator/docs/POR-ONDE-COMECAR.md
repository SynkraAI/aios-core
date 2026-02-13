# Por Onde Começar

> **Primeira vez aqui?** Este guia mostra exatamente o que fazer.

---

## Checklist do Primeiro Uso

```
ANTES DE COMEÇAR
□ Tenho Claude Code funcionando
□ Estou no diretório do meu projeto
□ Sei qual domínio quero criar (ex: copywriting, legal, marketing)

CRIAR MEU PRIMEIRO SQUAD
□ 1. Ler este documento (2 min)
□ 2. Ler o FAQ básico (5 min)
□ 3. Seguir o Tutorial Completo (15-30 min)
□ 4. Criar meu squad!

SE TIVER PROBLEMAS
□ Consultar FAQ
□ Consultar Troubleshooting
```

---

## Passo 1: Verifique os Pré-requisitos

### Obrigatório
- [ ] **Claude Code funcionando** - Você consegue rodar `@aios-master`?
- [ ] **Projeto AIOS** - Você está no diretório do seu projeto?

### Opcional (mas recomendado)
- [ ] **Materiais dos experts** - PDFs, livros, transcrições
- [ ] **Conhecimento do domínio** - Saber quem são os experts da área

### Não precisa
- [ ] ~~Saber programar~~
- [ ] ~~Configuração especial~~
- [ ] ~~Conta paga~~

---

## Passo 2: Entenda o Básico (5 minutos)

Leia APENAS estas perguntas do [FAQ](./FAQ.md):

1. **O que é um Squad?** - Entenda o conceito básico
2. **O que é um Elite Mind?** - Entenda quem são os experts
3. **YOLO ou QUALITY?** - Entenda os modos
4. **Quanto tempo demora?** - Saiba o que esperar

**Não precisa ler o FAQ inteiro agora.** Volte depois se tiver dúvidas.

---

## Passo 3: Siga o Tutorial (15-30 minutos)

Abra o [TUTORIAL-COMPLETO](./TUTORIAL-COMPLETO.md) e siga passo a passo.

O tutorial mostra:
- Exatamente o que digitar
- Exatamente o que você vai ver
- O que fazer em cada momento
- Como usar o squad criado

---

## Passo 4: Crie Seu Squad!

Após o tutorial, você está pronto. Execute:

```
@squad-creator
"Quero um squad de {seu domínio}"
```

---

## Mapa da Documentação

### Para Iniciantes (leia nesta ordem)

```
1. POR-ONDE-COMECAR.md  ← Você está aqui
   ↓
2. FAQ.md (seções Básico e Modos)
   ↓
3. TUTORIAL-COMPLETO.md
   ↓
4. Criar seu primeiro squad!
```

### Para Referência (consulte quando precisar)

```
• FAQ.md ────────────── Dúvidas sobre qualquer coisa
• COMMANDS.md ───────── Lista de todos os comandos
• TROUBLESHOOTING.md ── Quando algo dá errado
• QUICK-START.md ────── Resumo rápido do fluxo
```

### Para Aprofundar (opcional, avançado)

```
• CONCEPTS.md ────────────────── Como funciona por dentro
• AGENT-COLLABORATION.md ────── Como os 3 agentes colaboram
• ARCHITECTURE-DIAGRAMS.md ──── Diagramas técnicos
• HITL-FLOW.md ──────────────── Fluxo de checkpoints
```

---

## Qual Modo Escolher?

```
Você tem livros/PDFs dos experts?
│
├── NÃO ──→ Use YOLO (mais rápido, 60-75% fidelidade)
│
├── SIM, de todos ──→ Use QUALITY (mais lento, 85-95% fidelidade)
│
└── SIM, de alguns ──→ Use HYBRID (mistura dos dois)
```

**Na dúvida?** Comece com YOLO. Você pode melhorar depois.

---

## Exemplos de Squads por Domínio

| Eu quero criar squad de... | O que digitar |
|---------------------------|---------------|
| Copywriting | "Quero um squad de copywriting" |
| Marketing | "Quero um squad de marketing" |
| Vendas | "Quero um squad de vendas" |
| Jurídico | "Quero um squad jurídico" |
| Finanças | "Quero um squad de finanças pessoais" |
| Produtividade | "Quero um squad de produtividade" |
| Liderança | "Quero um squad de liderança" |
| Negociação | "Quero um squad de negociação" |

O sistema encontra automaticamente os melhores experts do domínio.

---

## Perguntas Comuns de Primeira Vez

### "E se eu não conhecer nenhum expert da área?"

Tudo bem! O sistema pesquisa e sugere automaticamente.

### "E se eu errar alguma coisa?"

Nada é salvo até você aprovar no final. Pode cancelar a qualquer momento com `*exit`.

### "Quanto tempo demora?"

- YOLO mode: 15-30 minutos
- QUALITY mode: 30-60 minutos

### "Posso parar no meio e continuar depois?"

Não recomendado. Complete em uma sessão só.

### "E se der erro?"

Veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) ou [FAQ.md](./FAQ.md).

---

## Próximos Passos

Depois de criar seu primeiro squad:

1. **Use o squad:** `@{nome-do-squad}`
2. **Valide a qualidade:** `*validate-squad {nome}`
3. **Melhore a fidelidade:** `*update-mind {expert} --sources ./materiais/`
4. **Crie mais squads!**

---

## Resumo

```
┌─────────────────────────────────────────────────────────┐
│                   RECEITA DE SUCESSO                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Claude Code funcionando? ✓                          │
│  2. Leu FAQ básico? ✓                                   │
│  3. Seguiu Tutorial Completo? ✓                         │
│  4. @squad-creator                                      │
│  5. "Quero um squad de {domínio}"                       │
│  6. Escolher modo (YOLO recomendado para primeira vez)  │
│  7. Aprovar minds                                       │
│  8. Aguardar                                            │
│  9. @{seu-squad} 🎉                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

**Pronto para começar?** Abra o [TUTORIAL-COMPLETO](./TUTORIAL-COMPLETO.md)!

---

**Squad Creator | Por Onde Começar v1.0**
*"Do zero ao squad em 30 minutos."*
