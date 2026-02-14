---
name: security-audit
description: Perform a basic offensive security audit of a specific target or code component.
agent: penetration-tester
inputs:
  - name: target
    description: The target scope (URL, IP, file path, or repository)
    required: true
outputs:
  - name: audit-report
    description: Markdown report containing findings and recommendations
---

# Security Audit Task

This task utilizes the Penetration Tester agent to perform a security assessment.

## Workflow

1.  **Scope Confirmation**
    *   Confirm the target: `{{inputs.target}}`
    *   Verify authorization to test.

2.  **Reconnaissance**
    *   Analyze the target to identify attack surface.
    *   Identify technologies, versions, and configurations.

3.  **Vulnerability Assessment**
    *   Check for OWASP Top 10 vulnerabilities relevant to the target.
    *   Look for sensitive data exposure or misconfigurations.

4.  **Reporting**
    *   Document all findings with severity classifications.
    *   Provide remediation steps for each issue.
    *   Generate the final report.
