<!-- Tradução: PT-BR | Original: /docs/en/architecture/adr/adr-isolated-vm-decision.md | Sincronização: 2026-01-27 -->

# ADR: Compatibilidade isolated-vm com macOS

**Status:** Substituído
**Data:** 2026-01-04
**Atualizado:** 2026-01-27
**Story:** TD-6 - Estabilidade de CI e Melhorias de Cobertura de Testes
**Autor:** @devops (Gage)
**Substituído Por:** Remoção da dependência (v3.11.0)

## Atualização (2026-01-27)

**Decisão Alterada:** `isolated-vm` foi **removido das dependências** completamente.

### Motivo da Remoção

Após análise do código, descobrimos que `isolated-vm` nunca foi realmente usado no codebase. Foi adicionado como placeholder para futura execução de código em sandbox, mas nunca foi implementado.

### Benefícios da Remoção

1. **Compatibilidade total com Node.js 18-24** em todas as plataformas (macOS, Linux, Windows)
2. **43 pacotes a menos** na árvore de dependências
3. **6 vulnerabilidades a menos** (8 → 2)
4. **Sem mais problemas de compilação de módulos nativos**
5. **100% de cobertura da matriz de CI** (12 combinações: 3 OS × 4 versões Node)

### Dependências Atualizadas

| Pacote        | Antes   | Depois       | Node.js Min         |
| ------------- | ------- | ------------ | ------------------- |
| `isolated-vm` | ^5.0.4  | **REMOVIDO** | N/A                 |
| `commander`   | ^14.0.1 | ^12.1.0      | >=18                |
| `glob`        | ^11.0.3 | ^10.4.4      | 14, 16, 18, 20, 22+ |

---

## Contexto Original (Histórico)

Durante testes de CI, observamos crashes SIGSEGV no macOS com Node.js 18.x e 20.x ao usar `isolated-vm`. Isso afeta a cobertura da matriz de CI.

## Descobertas da Investigação Original

### Configurações Afetadas

| Plataforma  | Versão Node | Status           |
| ----------- | ----------- | ---------------- |
| macOS ARM64 | 18.x        | ❌ Crash SIGSEGV |
| macOS ARM64 | 20.x        | ❌ Crash SIGSEGV |
| macOS ARM64 | 22.x        | ✅ Funciona      |
| macOS x64   | Todas       | ✅ Funciona      |
| Ubuntu      | Todas       | ✅ Funciona      |
| Windows     | Todas       | ✅ Funciona      |

### Causa Raiz

**Issue GitHub:** [laverdet/isolated-vm#424](https://github.com/laverdet/isolated-vm/issues/424) - "Segmentation fault on Node 20 macos arm64"

O problema é uma incompatibilidade conhecida entre os bindings nativos do `isolated-vm` e builds Node.js ARM64 no macOS para versões 18.x e 20.x.

## Decisão Original (Agora Substituída)

**Manter exclusão atual da matriz de CI** para macOS + Node 18/20.

Esta decisão foi substituída pela remoção completa do `isolated-vm` das dependências do projeto.

## Referências

- [isolated-vm#424 - Segmentation fault on Node 20 macos arm64](https://github.com/laverdet/isolated-vm/issues/424)
- [isolated-vm releases](https://github.com/laverdet/isolated-vm/releases)
