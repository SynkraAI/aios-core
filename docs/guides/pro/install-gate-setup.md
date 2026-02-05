# AIOS Pro Install-Gate Setup Guide

This guide explains how to configure access to `@aios/pro` from GitHub Packages.

**Story:** PRO-6 — License Key & Feature Gating System
**AC:** AC-12 — Install-gate via GitHub Packages token auth

---

## Overview

AIOS Pro is distributed via GitHub Packages with token-based authentication. This provides an "install-gate" that ensures only authorized users can download the package.

```
Purchase → Get GitHub Token → Setup .npmrc → Install @aios/pro → Activate License
```

---

## Quick Setup (Automated)

The fastest way to configure access:

```bash
# Interactive setup (will prompt for token)
aios pro setup

# Or with token directly
aios pro setup --token ghp_YOUR_TOKEN_HERE

# For global installation (all projects)
aios pro setup --token ghp_YOUR_TOKEN_HERE --global
```

---

## Manual Setup

### Step 1: Create a GitHub Personal Access Token (PAT)

1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens/new)
2. Give it a descriptive name: `AIOS Pro Access`
3. Select expiration (recommended: 90 days or custom)
4. Select scope: **`read:packages`** (minimum required)
5. Click "Generate token"
6. **Copy the token immediately** — you won't see it again!

> **Security Tip:** Use fine-grained tokens for better security. Classic tokens work but grant broader access.

### Step 2: Configure npm Registry

**Option A: Project-level (recommended for teams)**

Create `.npmrc` in your project root:

```ini
# .npmrc
@aios:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_YOUR_TOKEN_HERE
```

> **Important:** Add `.npmrc` to `.gitignore` to avoid committing tokens!

**Option B: Global (personal use)**

```bash
npm config set @aios:registry https://npm.pkg.github.com
npm config set //npm.pkg.github.com/:_authToken ghp_YOUR_TOKEN_HERE
```

### Step 3: Install AIOS Pro

```bash
npm install @aios/pro
```

### Step 4: Activate Your License

```bash
aios pro activate --key PRO-XXXX-XXXX-XXXX-XXXX
```

---

## Troubleshooting

### Error: 401 Unauthorized

```
npm error 401 Unauthorized - GET https://npm.pkg.github.com/@aios%2fpro
```

**Causes:**
1. Token is invalid or expired
2. Token doesn't have `read:packages` scope
3. `.npmrc` is misconfigured

**Solutions:**

```bash
# Verify your token is set
npm config get //npm.pkg.github.com/:_authToken

# If empty or wrong, reconfigure
npm config set //npm.pkg.github.com/:_authToken ghp_YOUR_NEW_TOKEN

# Or run setup again
aios pro setup
```

### Error: 404 Not Found

```
npm error 404 Not Found - GET https://npm.pkg.github.com/@aios%2fpro
```

**Causes:**
1. Package not yet published
2. Token doesn't have access to the repository

**Solutions:**
- Contact support@synkra.ai to verify your access
- Ensure your GitHub account has been granted access

### Error: ENOENT .npmrc

```
ENOENT: no such file or directory, open '.npmrc'
```

**Solution:** Run `aios pro setup` to create the file automatically.

### Token Expired

GitHub PATs expire based on the expiration you set during creation.

**Solution:**
1. Create a new token at GitHub Settings
2. Run `aios pro setup --token NEW_TOKEN`

---

## Security Best Practices

### 1. Never Commit Tokens

Always add `.npmrc` to `.gitignore`:

```gitignore
# Credentials
.npmrc
```

### 2. Use Fine-Grained Tokens

Fine-grained PATs provide:
- Repository-specific access
- Reduced blast radius if compromised
- Better audit logging

### 3. Rotate Tokens Regularly

Set calendar reminders to rotate tokens every 90 days.

### 4. Use Environment Variables in CI/CD

For CI/CD pipelines, use secrets instead of hardcoded tokens:

**GitHub Actions:**
```yaml
- name: Setup npm for GitHub Packages
  run: |
    echo "@aios:registry=https://npm.pkg.github.com" >> .npmrc
    echo "//npm.pkg.github.com/:_authToken=${{ secrets.AIOS_PRO_TOKEN }}" >> .npmrc
```

**GitLab CI:**
```yaml
before_script:
  - echo "@aios:registry=https://npm.pkg.github.com" >> .npmrc
  - echo "//npm.pkg.github.com/:_authToken=${AIOS_PRO_TOKEN}" >> .npmrc
```

### 5. Minimal Scope Principle

Only grant `read:packages` scope — nothing more is needed for installation.

---

## Team Setup

For teams, we recommend:

1. **Create a service account** on GitHub for the team
2. **Generate a PAT** from the service account
3. **Store the token** in your team's secrets manager
4. **Share configuration** via team documentation (not the token itself)

Each team member can also use their personal token if preferred.

---

## Verifying Installation

After setup, verify everything works:

```bash
# Check if package is accessible
npm view @aios/pro

# Install the package
npm install @aios/pro

# Verify pro features
aios pro features
```

---

## Offline Operation

Once `@aios/pro` is installed and a license is activated:

- Works offline for **30 days** without revalidation
- **7-day grace period** after cache expiry
- No internet needed for day-to-day feature checks

The install-gate only applies during initial `npm install` — after that, the package is local.

---

## Support

- **Documentation:** https://synkra.ai/pro/docs
- **Purchase:** https://synkra.ai/pro
- **Support:** support@synkra.ai
- **Issues:** https://github.com/SynkraAI/aios-core/issues

---

*AIOS Pro Install-Gate Setup Guide v1.0*
*Story PRO-6 — License Key & Feature Gating System*
