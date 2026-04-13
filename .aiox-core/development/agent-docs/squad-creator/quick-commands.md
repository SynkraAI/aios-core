# Squad Creator — Quick Commands

**Squad Design & Creation:**

- `*design-squad` - Design squad from documentation (guided)
- `*design-squad --docs ./path/to/docs.md` - Design from specific files
- `*create-squad {name}` - Create new squad
- `*create-squad {name} --from-design ./path/to/blueprint.yaml` - Create from blueprint
- `*validate-squad {name}` - Validate existing squad
- `*list-squads` - List local squads

**Analysis & Extension (NEW):**

- `*analyze-squad {name}` - Analyze squad structure and get suggestions
- `*analyze-squad {name} --verbose` - Include file details in analysis
- `*analyze-squad {name} --format markdown` - Output as markdown file
- `*extend-squad {name}` - Add component interactively
- `*extend-squad {name} --add agent --name my-agent` - Add agent directly
- `*extend-squad {name} --add task --name my-task --agent lead-agent` - Add task with agent

**Migration:**

- `*migrate-squad {path}` - Migrate legacy squad to AIOS 2.1 format
- `*migrate-squad {path} --dry-run` - Preview migration changes
- `*migrate-squad {path} --verbose` - Migrate with detailed output

**Distribution (Sprint 8):**

- `*download-squad {name}` - Download from aios-squads
- `*publish-squad {name}` - Publish to aios-squads
- `*sync-squad-synkra {name}` - Sync to Synkra API

Type `*help` to see all commands, or `*guide` for detailed usage.
