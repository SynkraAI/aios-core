# Credentials Configuration - Enterprise QA DevOps Squad

> **Security Notice**: Never commit credentials to version control. Use environment variables or secure vaults.

## Quick Setup

Run the interactive setup:

```bash
node scripts/setup-credentials.js
```

Or manually configure the `.env` file.

## Atlassian (Jira & Confluence)

### Step 1: Get API Token

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Give it a descriptive name (e.g., "AIOS Integration")
4. Copy the token immediately (you won't see it again)

### Step 2: Configure Environment

```bash
# .env
ATLASSIAN_DOMAIN=company.atlassian.net
ATLASSIAN_EMAIL=your.email@company.com
ATLASSIAN_API_TOKEN=your-api-token-here
```

### Verify Connection

```bash
node scripts/health-check.js
```

Or test directly:

```bash
@jira *search "project = PROJ" --maxResults 1
```

## Xray Test Management

### Step 1: Get API Keys (Xray Cloud)

1. Go to Xray Settings in Jira
2. Navigate to: Settings → Apps → Xray → API Keys
3. Click "Create API Key"
4. Copy both Client ID and Client Secret

### Step 2: Configure Environment

```bash
# .env
XRAY_CLIENT_ID=your-client-id
XRAY_CLIENT_SECRET=your-client-secret
```

### For Xray Server/Data Center

```bash
# .env
XRAY_API_BASE_URL=https://jira.company.com
XRAY_API_USER=your-username
XRAY_API_PASSWORD=your-password
```

### Verify Connection

```bash
@xray *help
```

## Microsoft 365 (Email, Teams, Calendar)

### Step 1: Create Azure AD App Registration

1. Go to Azure Portal → Azure Active Directory → App registrations
2. Click "New registration"
3. Name: "AIOS Enterprise Integration"
4. Supported account types: "Accounts in this organizational directory only"
5. Redirect URI: Leave empty (not needed for app-only auth)
6. Click "Register"

### Step 2: Configure API Permissions

1. Go to "API permissions"
2. Click "Add a permission" → "Microsoft Graph"
3. Choose "Application permissions"
4. Add these permissions:
   - Mail.Send
   - Mail.Read
   - Calendars.ReadWrite
   - ChannelMessage.Send
   - Channel.ReadBasic.All
   - Team.ReadBasic.All
   - Files.ReadWrite.All
5. Click "Grant admin consent for [Organization]"

### Step 3: Create Client Secret

1. Go to "Certificates & secrets"
2. Click "New client secret"
3. Description: "AIOS Integration"
4. Expiration: Choose appropriate period
5. Copy the secret value immediately

### Step 4: Configure Environment

```bash
# .env
MS365_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MS365_CLIENT_SECRET=your-client-secret
MS365_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Find Your IDs

- **Client ID**: App registration overview page
- **Tenant ID**: Azure AD overview page
- **Client Secret**: Created in Step 3

### Verify Connection

```bash
node scripts/health-check.js
```

## Environment File Template

Create `.env` in the squad directory or project root:

```bash
# ===========================================
# Enterprise QA DevOps Squad Configuration
# ===========================================

# Atlassian Configuration
ATLASSIAN_DOMAIN=company.atlassian.net
ATLASSIAN_EMAIL=user@company.com
ATLASSIAN_API_TOKEN=

# Xray Configuration (Cloud)
XRAY_CLIENT_ID=
XRAY_CLIENT_SECRET=

# Xray Configuration (Server/DC) - Alternative
# XRAY_API_BASE_URL=https://jira.company.com
# XRAY_API_USER=
# XRAY_API_PASSWORD=

# Microsoft 365 Configuration (Optional)
MS365_CLIENT_ID=
MS365_CLIENT_SECRET=
MS365_TENANT_ID=

# Azure DevOps Configuration (Optional)
# AZURE_DEVOPS_PAT=
# AZURE_DEVOPS_ORG=

# Debug Mode
# AIOS_DEBUG=true
```

## Security Best Practices

### Token Rotation

| Service | Recommended Rotation |
|---------|---------------------|
| Atlassian API Token | Every 90 days |
| Xray API Keys | Every 90 days |
| Azure AD Client Secret | Before expiration |

### Least Privilege

Request only permissions you need:

**Jira**: Only project-level access if possible
**Confluence**: Only required space access
**Microsoft 365**: Only Mail.Send if not reading mail

### Audit Logging

Enable audit logging in each service to track API usage:

- **Atlassian**: Admin → Audit log
- **Azure AD**: Sign-in logs, Audit logs

### Secret Management

For production environments, consider:

- **Azure Key Vault**
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **GitHub Secrets** (for CI/CD)

## Troubleshooting

### Atlassian 401 Unauthorized

1. Verify API token is correct
2. Check token hasn't expired
3. Verify email matches Atlassian account
4. Ensure user has Jira/Confluence access

### Xray Authentication Failed

1. Verify Client ID and Secret
2. Check Xray is installed in your Jira instance
3. Verify your user has Xray access

### Microsoft 403 Forbidden

1. Verify admin consent was granted
2. Check all required permissions are added
3. Wait a few minutes after granting consent
4. Verify app registration is not disabled

### Connection Timeout

1. Check network connectivity
2. Verify firewall allows HTTPS to:
   - *.atlassian.net
   - *.getxray.app
   - login.microsoftonline.com
   - graph.microsoft.com

---

*Enterprise QA DevOps Squad - Credentials Configuration v1.0*
