# Guia de Criação de Squad — Estrutura e Template Completos

## O que é um Squad
Uma equipe modular de agentes especializados projetada para um domínio específico (ex: Marketing, Jurídico, Elite Dev).

## Estrutura de Diretórios
```
squads/{nome}/
├── squad.yaml
├── agents/
├── tasks/
├── config/
└── README.md
```

## Passos para Registro
1. Criar a estrutura de diretórios.
2. Definir o manifesto `squad.yaml`.
3. Criar arquivos de comando em `.claude/commands/SQUADS/{nome}/`.
