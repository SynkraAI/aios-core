# AIOS Developer - Meta-Agent Documentation

## Overview

The AIOS Developer is a meta-agent within the AIOS-FULLSTACK framework that specializes in creating and modifying framework components. It represents a fundamental capability of the system: self-modification and evolution through AI-assisted development.

## What is a Meta-Agent?

A meta-agent is an agent that can create, modify, and manage other agents and framework components. It embodies the principle of "code that writes code" but with intelligent understanding of:
- Framework architecture and patterns
- Security and authorization requirements
- Component interdependencies
- Best practices and standards

## Core Capabilities

### 1. Agent Creation (`*create-agent`)
- Interactively elicits requirements for new agents
- Generates properly structured agent definition files
- Ensures consistency with framework standards
- Validates security and access controls

### 2. Task Creation (`*create-task`)
- Designs executable workflows for agents
- Structures interactive elicitation processes
- Defines validation and error handling
- Creates reusable task patterns

### 3. Workflow Creation (`*create-workflow`)
- Orchestrates multi-agent processes
- Defines stage transitions and handoffs
- Manages complex project flows
- Ensures proper resource allocation

### 4. Manifest Management (`*update-manifest`)
- Safely updates team configurations
- Maintains YAML integrity
- Creates backups before modifications
- Validates all references

## Security Architecture

### Authorization Controls
- Role-based access control (RBAC) for agent activation
- User authentication required for sensitive operations
- Audit logging of all meta-agent activities
- Session-based permission management

### Code Generation Security
- Template-based generation (no dynamic eval)
- Input sanitization for all user data
- Security pattern validation
- Code review mechanisms

### Memory Layer Protection
- Scoped access to framework components only
- Rate limiting on memory operations
- Sensitive data filtering
- Query result validation

## Usage Guide

### Activation
```
/aios-developer
```

### Basic Commands
- `*help` - Display available commands
- `*create-agent` - Start agent creation workflow
- `*create-task` - Design new task
- `*create-workflow` - Build multi-stage workflow
- `*update-manifest` - Register components
- `*test-memory` - Verify memory layer connection
- `*list-components` - Show created components
- `*validate-component` - Security validation
- `*exit` - Deactivate meta-agent

### Example: Creating a New Agent

1. Activate the meta-agent:
   ```
   /aios-developer
   ```

2. Start agent creation:
   ```
   *create-agent
   ```

3. Follow the interactive prompts:
   - Agent name: `data-analyst`
   - Role: Senior Data Analyst
   - Icon: 📊
   - When to use: For data analysis, reporting, and insights
   - Commands: analyze, report, visualize
   - Security: Standard permissions, memory access enabled

4. Update manifest:
   ```
   *update-manifest
   ```

5. Test the new agent:
   ```
   /data-analyst
   ```

## Best Practices

### Component Naming
- Use lowercase with hyphens (e.g., `api-tester`)
- Be descriptive but concise
- Avoid generic names
- Include function in name

### Security First
- Always define authorization requirements
- Validate all inputs
- Use templates, not dynamic code
- Log sensitive operations

### Documentation
- Document all commands clearly
- Include usage examples
- Explain error conditions
- Provide troubleshooting steps

### Testing
- Test each component after creation
- Verify manifest integrity
- Check memory layer integration
- Validate security controls

## Troubleshooting

### Common Issues

**Agent Not Activating**
- Check manifest registration
- Verify file path and name
- Ensure YAML syntax is valid
- Check for duplicate IDs

**Memory Layer Connection Failed**
- Verify memory service is running
- Check network connectivity
- Validate API endpoint
- Review authentication

**Manifest Update Errors**
- Check backup was created
- Validate YAML syntax
- Ensure no circular references
- Verify file permissions

**Security Validation Failed**
- Review input sanitization
- Check for eval() usage
- Validate template structure
- Ensure proper escaping

### Debug Mode
Enable detailed logging:
```javascript
process.env.DEBUG = 'aios:*';
```

### Support
For issues or questions:
1. Check this documentation
2. Review error messages carefully
3. Consult framework logs
4. Contact framework team

## Security Utilities

The meta-agent includes two critical security utilities:

### SecurityChecker
Validates generated code for vulnerabilities:
- Detects dangerous patterns (eval, dynamic imports)
- Checks for SQL injection risks
- Validates path traversal attempts
- Sanitizes user inputs

```javascript
const checker = new SecurityChecker();
const result = checker.validateCode(generatedCode);
if (!result.valid) {
  console.error('Security issues found:', result.errors);
}
```

### YAMLValidator
Ensures YAML integrity:
- Validates syntax and structure
- Checks required fields
- Auto-fixes common issues
- Prevents manifest corruption

```javascript
const validator = new YAMLValidator();
const result = await validator.validate(yamlContent, 'agent');
if (!result.valid) {
  const fixed = await validator.autoFix(yamlContent);
}
```

## Integration with Memory Layer

The meta-agent integrates with the AIOS Memory Layer to:
- Track all created components
- Store modification history
- Enable component discovery
- Support intelligent suggestions

### Memory Operations

**Adding Component Memory**
```javascript
await memoryClient.addMemory({
  type: 'component_created',
  component: 'agent',
  name: agentName,
  metadata: { /* details */ }
});
```

**Searching Components**
```javascript
const components = await memoryClient.searchMemories(
  'agents created last week',
  sessionId,
  10
);
```

## Future Enhancements

### Planned Features
- Visual component designer
- Automated testing generation
- Component versioning
- Dependency management
- Performance profiling
- AI-assisted debugging

### Research Areas
- Self-improving agents
- Component optimization
- Pattern recognition
- Automated documentation
- Security analysis

## Contributing

To contribute to the meta-agent:
1. Review existing patterns
2. Follow security guidelines
3. Add comprehensive tests
4. Update documentation
5. Submit for review

## References

- [AIOS-FULLSTACK Architecture](../architecture/)
- [Security Guidelines](../SECURITY.md)
- [Memory Layer API](../aios-memory-layer-mvp/docs/api/)
- [Agent Development Guide](../agents/README.md)