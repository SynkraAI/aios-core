# Ralph Squad - Source Tree

```
squads/ralph/
├── squad.yaml                          # Squad manifest
├── README.md                           # Documentation
├── config/
│   ├── coding-standards.md             # Coding standards (extends core)
│   ├── tech-stack.md                   # Tech stack reference
│   └── source-tree.md                  # This file
├── agents/
│   └── ralph.md                        # Ralph agent definition
├── tasks/
│   ├── ralph-develop.md                # Main autonomous loop
│   ├── ralph-report.md                 # Progress report
│   ├── ralph-resume.md                 # Resume interrupted session
│   ├── ralph-status.md                 # Quick status
│   └── ralph-config.md                 # Configuration management
├── scripts/
│   ├── ralph-parser.js                 # Story/PRD task parser
│   ├── ralph-state.js                  # State serialization/deserialization
│   ├── ralph-progress.js               # Progress tracking (append to progress.md)
│   └── ralph-context-monitor.js        # Token estimation and reset detection
├── workflows/                          # (future: multi-step workflows)
├── checklists/                         # (future: validation checklists)
├── templates/                          # (future: document templates)
├── tools/                              # (future: custom tools)
└── data/                               # (future: static data)
```
