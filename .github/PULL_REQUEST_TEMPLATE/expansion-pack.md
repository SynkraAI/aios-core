---
name: Expansion Pack Pull Request
about: Submit a new expansion pack or update to existing pack
title: '[EXPANSION-PACK] '
labels: 'expansion-pack', 'needs-po-review'
assignees: ''
---

# Expansion Pack Pull Request

## 📦 Pack Information
- **Pack Name:** 
- **Version:** 
- **Type:** [ ] New Pack [ ] Update to Existing Pack
- **License:** [ ] Open-Source (MIT) [ ] Proprietary (separate repo)

## 📋 Description
A clear description of what this expansion pack does and what changes are included.

## 🎯 Purpose
What problem does this pack solve? What domain does it cover?

## 📁 Files Changed
- File 1
- File 2
- File 3

## 🏗️ Structure
- **Agents:** X agents
- **Tasks:** Y tasks
- **Templates:** Z templates
- **Checklists:** W checklists

## ✅ Compliance Checklist
- [ ] Follows AIOS expansion pack structure
- [ ] All agents follow naming convention (`{agent-id}-{task-name}.md`)
- [ ] All tasks have proper YAML frontmatter
- [ ] `config.yaml` is properly configured
- [ ] README.md is complete with usage examples
- [ ] No hard dependencies on proprietary packs
- [ ] All code follows project style guidelines

## 🧪 Testing
- [ ] Pack can be installed successfully
- [ ] All agents can be activated
- [ ] All tasks can be executed
- [ ] Integration with core framework works
- [ ] No breaking changes to existing functionality

## 📖 Documentation
- [ ] README.md updated
- [ ] Agent documentation complete
- [ ] Task documentation complete
- [ ] Usage examples provided
- [ ] Integration guide included (if applicable)

## 🔗 Integration
- [ ] Works with core AIOS framework
- [ ] No conflicts with other expansion packs
- [ ] External dependencies documented

## 🎨 Example Usage
```bash
# Example of how to use this pack
@pack-name:agent-name
*task-name
```

## 🔒 Security
- [ ] No sensitive data included
- [ ] No hardcoded credentials
- [ ] API keys use environment variables
- [ ] Security best practices followed

## 👥 Contributor
- **Author:** 
- [ ] Willing to maintain this pack
- [ ] Can provide support

## 📊 Impact Assessment
- [ ] No breaking changes
- [ ] Backward compatible
- [ ] Performance impact: [ ] None [ ] Low [ ] Medium [ ] High

---

**⚠️ IMPORTANT:** This PR requires Product Owner (PO) approval before merge. The PO will review:
- Pack quality and completeness
- Compliance with AIOS standards
- Integration with framework
- Documentation quality

**Review Process:**
1. Code review by maintainers
2. PO review and approval
3. Merge after approval

