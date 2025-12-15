# STORY: First-Run Experience

**ID:** STORY-1.11  
**Épico:** [EPIC-S1](../../../epics/epic-s1-installer-foundation.md)  
**Sprint:** 1 | **Points:** 2 | **Priority:** 🟡 Medium  
**Created:** 2025-01-19

---

## 📊 User Story

**Como** desenvolvedor,  
**Quero** mensagem de boas-vindas e próximos passos após instalação,  
**Para** saber o que fazer a seguir

---

## ✅ Acceptance Criteria

- [ ] Welcome message com branding AIOS v2.1
- [ ] Lista próximos passos claros (numbered)
- [ ] Comandos disponíveis (aios --help)
- [ ] Link para documentação
- [ ] Optional: Quick start tutorial

---

## 🔧 Implementation

```javascript
function displayFirstRunExperience() {
  console.log(chalk.green.bold('\n✅ AIOS v2.1 installed successfully!\n'));
  console.log(chalk.blue('Next steps:\n'));
  console.log('  1. Run', chalk.yellow('aios --help'), 'to see available commands');
  console.log('  2. Run', chalk.yellow('aios agents list'), 'to see available agents');
  console.log('  3. Run', chalk.yellow('aios workers list'), 'to explore 97+ workers');
  console.log('  4. Read docs:', chalk.cyan('https://aios.dev/docs/v2.1\n'));
  
  const { tutorial } = await prompt({
    type: 'confirm',
    message: 'Start quick tutorial?',
    default: false
  });
  
  if (tutorial) await runQuickTutorial();
}
```

---

## 📋 Tasks (2 pts = ~1 dia)

- [ ] 1.11.1: Create welcome screen (1h)
- [ ] 1.11.2: List next steps (1h)
- [ ] 1.11.3: Generate quick reference card (2h)
- [ ] 1.11.4: Link to docs (1h)
- [ ] 1.11.5: Optional tutorial (3h)

**Total:** 8h

---

## 🔗 Dependencies

- **Depende:** [1.8] Installation Validation
- **Final story before:** [1.12] Documentation

---

**Criado por:** River 🌊

