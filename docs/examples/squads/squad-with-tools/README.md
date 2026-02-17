# Squad with Custom Tools Example

Demonstrates how to integrate custom JavaScript tools into a squad.

## Structure

```
squad-with-tools/
├── squad.yaml
├── README.md
├── agents/
│   └── analyzer-agent.md
└── tools/
    └── text-analyzer.js
```

## Usage

```bash
@squad-creator
*load-squad ./docs/examples/squads/squad-with-tools

@analyze-agent
*analyze "Your text here to analyze"
```

## Tool Integration

Tools are JavaScript modules that export:

```javascript
module.exports = {
  name: 'tool-name',
  version: '1.0.0',
  description: 'What the tool does',
  
  async execute(input) {
    // Tool logic
    return result;
  }
};
```

## What This Demonstrates

1. **Custom tools** - JavaScript tools in `tools/` directory
2. **Tool declaration** - Listing tools in `components.tools`
3. **Agent-tool binding** - How agents use tools
4. **Async execution** - Tools can be async

See [Squad Development Guide](../../../guides/squads-guide.md) for details.
