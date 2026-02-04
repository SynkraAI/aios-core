# Enterprise Permission Acquisition Guide

> Step-by-step guide for obtaining necessary permissions in enterprise environments

**Version:** 1.0.0
**Last Updated:** 2026-02-04

---

## Table of Contents

1. [Overview](#1-overview)
2. [Atlassian (Jira & Confluence)](#2-atlassian-jira--confluence)
3. [Xray Test Management](#3-xray-test-management)
4. [Microsoft 365](#4-microsoft-365)
5. [Enterprise Approval Templates](#5-enterprise-approval-templates)
6. [Security & Compliance Checklist](#6-security--compliance-checklist)

---

## 1. Overview

### Permission Acquisition Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTERPRISE PERMISSION FLOW                    │
│                                                                  │
│  1. Identify Requirements                                        │
│     ↓                                                            │
│  2. Document Business Justification                              │
│     ↓                                                            │
│  3. Submit Access Request                                        │
│     ↓                                                            │
│  4. Security Review                                              │
│     ↓                                                            │
│  5. Manager/Owner Approval                                       │
│     ↓                                                            │
│  6. Provision Credentials                                        │
│     ↓                                                            │
│  7. Configure & Test                                             │
│     ↓                                                            │
│  8. Document in Secrets Manager                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Required Permissions Summary

| Platform | Permission Level | Typical Wait Time |
|----------|-----------------|-------------------|
| Atlassian Cloud | API Token | 1-2 days |
| Atlassian Server | Personal Access Token | 3-5 days |
| Xray Cloud | OAuth App | 3-5 days |
| Microsoft 365 | Azure AD App | 5-10 days |

---

## 2. Atlassian (Jira & Confluence)

### Cloud: API Token

#### Required Permissions

| Permission | Jira | Confluence | Purpose |
|------------|------|------------|---------|
| Browse projects | ✓ | - | Read issues, search |
| Create issues | ✓ | - | Create bugs, tasks |
| Edit issues | ✓ | - | Update status, fields |
| Transition issues | ✓ | - | Move through workflow |
| Add comments | ✓ | ✓ | Document findings |
| View space | - | ✓ | Read pages |
| Add page | - | ✓ | Create documentation |
| Edit page | - | ✓ | Update documentation |
| Add attachment | ✓ | ✓ | Upload files |

#### Step-by-Step: Creating API Token

1. **Log into Atlassian Account**
   - Go to https://id.atlassian.com/manage-profile/security/api-tokens
   - Or: Avatar → Account Settings → Security → API tokens

2. **Create Token**
   - Click "Create API token"
   - Label: `enterprise-qa-devops-integration`
   - Copy the token immediately (shown only once)

3. **Configure Permissions**
   - Tokens inherit the user's permissions
   - For service accounts: Request group membership in relevant Jira/Confluence projects
   - Recommended: Create dedicated service account user

4. **Test Access**
   ```bash
   curl -u "email@company.com:API_TOKEN" \
     -H "Content-Type: application/json" \
     "https://yoursite.atlassian.net/rest/api/3/myself"
   ```

#### Service Account Request Template

```
Subject: Request for Atlassian Service Account - QA Automation

Business Justification:
- Automated test result synchronization
- Sprint documentation generation
- Cross-platform workflow automation

Requested Access:
- Jira Projects: [PROJECT-1, PROJECT-2]
  - Browse, Create, Edit, Transition issues
- Confluence Spaces: [SPACE-1, SPACE-2]
  - View, Add, Edit pages

Account Details:
- Account Name: svc-qa-automation@company.com
- Owner: [Your Name]
- Team: QA/DevOps
- Renewal Period: Annual review
```

### Server/Data Center: Personal Access Token

#### Creating PAT

1. **Access Token Management**
   - Go to: Profile → Personal Access Tokens
   - Or: `https://jira.yourcompany.com/secure/ViewProfile.jspa?selectedTab=com.atlassian.pats.pats-plugin:jira-user-personal-access-tokens`

2. **Create Token**
   - Click "Create token"
   - Name: `enterprise-qa-devops`
   - Expiry: Set appropriate expiration (recommend 90-365 days)
   - Permissions: Select minimum required

3. **Configure in Application**
   ```bash
   export ATLASSIAN_SERVER_URL=https://jira.yourcompany.com
   export ATLASSIAN_PERSONAL_ACCESS_TOKEN=xxxxx
   export ATLASSIAN_IS_CLOUD=false
   ```

---

## 3. Xray Test Management

### Cloud: OAuth Application

#### Required Scopes

| Scope | Purpose |
|-------|---------|
| `read:test-plan` | Read test plans |
| `write:test-execution` | Import test results |
| `read:test` | Read test definitions |
| `write:test` | Create/update tests |
| `read:coverage` | View requirement coverage |

#### Step-by-Step: Creating OAuth App

1. **Access Xray Settings**
   - Go to: Jira Settings → Apps → Xray
   - Or contact your Xray administrator

2. **Create API Key**
   - Navigate to: API Keys section
   - Click "Create API Key"
   - Copy both Client ID and Client Secret

3. **Verify Permissions**
   - Xray permissions are tied to Jira project permissions
   - Ensure service account has access to relevant projects

4. **Test Authentication**
   ```bash
   curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"client_id":"YOUR_ID","client_secret":"YOUR_SECRET"}' \
     "https://xray.cloud.getxray.app/api/v2/authenticate"
   ```

### Server/Data Center

#### Configuration

```bash
export XRAY_API_BASE_URL=https://jira.yourcompany.com
export XRAY_API_USER=svc-qa-automation
export XRAY_API_PASSWORD=xxxxx
export XRAY_IS_CLOUD=false
```

---

## 4. Microsoft 365

### Azure AD App Registration

#### Required Permissions (Microsoft Graph)

| Permission | Type | Purpose |
|------------|------|---------|
| `Mail.Send` | Application | Send emails |
| `Mail.Read` | Application | Read mailbox |
| `Calendars.ReadWrite` | Application | Manage events |
| `Team.ReadBasic.All` | Application | List teams |
| `Channel.ReadBasic.All` | Application | List channels |
| `ChannelMessage.Send` | Application | Post to channels |
| `User.Read.All` | Application | Look up users |
| `Files.ReadWrite.All` | Application | OneDrive/SharePoint |

#### Step-by-Step: App Registration

1. **Access Azure Portal**
   - Go to: https://portal.azure.com
   - Navigate to: Azure Active Directory → App registrations

2. **Create Registration**
   - Click "New registration"
   - Name: `Enterprise QA DevOps Integration`
   - Supported account types: "Accounts in this organizational directory only"
   - Redirect URI: Leave blank (using client credentials)

3. **Configure API Permissions**
   - Go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Choose "Application permissions"
   - Add required permissions from table above
   - Click "Grant admin consent for [Organization]"

4. **Create Client Secret**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: `enterprise-qa-devops`
   - Expiry: Choose appropriate (recommend 12-24 months)
   - Copy the secret value immediately

5. **Note Configuration Values**
   ```bash
   export MS365_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   export MS365_CLIENT_SECRET=xxxxx
   export MS365_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

6. **Test Access**
   ```bash
   curl -X POST \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "client_id=$MS365_CLIENT_ID&scope=https://graph.microsoft.com/.default&client_secret=$MS365_CLIENT_SECRET&grant_type=client_credentials" \
     "https://login.microsoftonline.com/$MS365_TENANT_ID/oauth2/v2.0/token"
   ```

### Enterprise Approval Process

Most organizations require additional approvals for Graph API permissions:

1. **Submit Approval Request**
   - Provide business justification
   - List all requested permissions
   - Specify data access scope

2. **Security Review**
   - Application architecture review
   - Data flow documentation
   - Credential storage plan

3. **Admin Consent**
   - Global Administrator or Application Administrator
   - Review and approve permissions

---

## 5. Enterprise Approval Templates

### Access Request Email

```
Subject: API Integration Access Request - Enterprise QA DevOps Squad

Dear [IT Security/Platform Admin],

I am requesting API access for the Enterprise QA DevOps automation integration.
This integration will streamline our QA processes by automating:

1. Test result synchronization (Jira/Xray)
2. Documentation generation (Confluence)
3. Team notifications (Microsoft Teams/Outlook)

TECHNICAL DETAILS:
- Platform: [Atlassian Cloud / Microsoft 365]
- Account Type: Service Account
- Authentication: [API Token / OAuth 2.0]
- IP Range: [Specify if applicable]

SECURITY CONTROLS:
- Credentials stored in [Azure Key Vault / AWS Secrets Manager / 1Password]
- Token rotation: Every 90 days
- Access logging enabled
- Minimum required permissions only

BUSINESS JUSTIFICATION:
- Reduces manual documentation effort by 90%
- Improves test traceability from 60% to 95%
- Enables real-time visibility into QA status

PERMISSIONS REQUESTED:
[List specific permissions from above sections]

OWNER/CONTACT:
- Primary: [Your Name] - [email]
- Team: [QA/DevOps Team]
- Manager: [Manager Name]

Please let me know if additional information is needed.

Best regards,
[Your Name]
```

### Security Questionnaire Responses

#### Data Handling

| Question | Response |
|----------|----------|
| What data will be accessed? | Issue metadata, test results, page content |
| Will data be stored locally? | Cached for resilience only, encrypted at rest |
| Data retention period | Session only, no persistent storage |
| Data encryption | TLS 1.2+ in transit, AES-256 at rest |

#### Authentication

| Question | Response |
|----------|----------|
| Authentication method | OAuth 2.0 / API Token with Basic Auth |
| Credential storage | Enterprise secrets manager (Azure KV, AWS SM, 1Password) |
| Token rotation | Every 90 days |
| MFA required? | Service account with supervised access |

#### Access Control

| Question | Response |
|----------|----------|
| Who has access to credentials? | DevOps team leads only |
| How is access audited? | All API calls logged with correlation IDs |
| Access review frequency | Quarterly |
| Deprovisioning process | Documented, token revocation procedure |

---

## 6. Security & Compliance Checklist

### Pre-Deployment

- [ ] Business justification documented
- [ ] Security review completed
- [ ] Manager approval obtained
- [ ] Admin consent granted (Microsoft 365)
- [ ] Service account created
- [ ] Minimum permissions verified
- [ ] Credentials stored in secrets manager

### Configuration

- [ ] Environment variables set
- [ ] Health check passing
- [ ] Test API calls successful
- [ ] Logging configured
- [ ] Alerting configured

### Ongoing

- [ ] Token rotation scheduled (90-day reminder)
- [ ] Quarterly access review
- [ ] Annual security audit
- [ ] Incident response plan documented

### Compliance Mapping

| Requirement | Implementation |
|-------------|----------------|
| SOC 2 - Access Control | Service account with RBAC |
| SOC 2 - Encryption | TLS 1.2+, AES-256 at rest |
| GDPR - Data Minimization | Only required fields accessed |
| HIPAA - Audit Logging | All API calls logged |
| ISO 27001 - Access Review | Quarterly permission review |

---

## Quick Reference: Minimum Viable Permissions

### For Basic Test Sync Only

**Jira:**
- Browse Projects (read-only)
- Add Comments

**Xray:**
- Write Test Execution (import results)

**Confluence:**
- View Space (read-only)

### For Full Automation

**Jira:**
- Browse, Create, Edit, Transition issues
- Add Comments, Attachments

**Xray:**
- Full Test Management access

**Confluence:**
- View, Add, Edit, Delete pages
- Add Attachments

**Microsoft 365:**
- Mail.Send, Channel messages
- Teams/Channel read access

---

**Last Updated:** 2026-02-04
**Maintainer:** Enterprise QA DevOps Squad
