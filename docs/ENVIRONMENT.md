# Environment Variables

This document lists all environment variables used by Synkra AIOS and its components.

## Overview

Synkra AIOS uses environment variables for configuration, API keys, and sensitive information. **Never commit environment variables to the repository.**

## Required Environment Variables

### Core Framework

Currently, Synkra AIOS does not require any mandatory environment variables for basic operation. All configuration is done through `core-config.yaml` and Squad configuration files.

## Optional Environment Variables

### GitHub Integration

If you're using GitHub CLI features:

```bash
GITHUB_TOKEN=your_github_token_here
```

**Note:** GitHub CLI (`gh`) handles authentication automatically. This variable is only needed if you're using GitHub API directly.

### Squads

Some Squads may require environment variables. Check each pack's README for specific requirements.

#### ETL Squad

```bash
# Optional: API keys for data sources
YOUTUBE_API_KEY=your_youtube_api_key
TWITTER_API_KEY=your_twitter_api_key
# ... other service API keys
```

#### Private Squads

Private Squads (in `aios-Squads` repository) may require additional environment variables. Refer to each pack's documentation.

## Environment File Setup

### Creating `.env` File

1. Copy the example file (if available):
   ```bash
   cp .env.example .env
   ```

2. Or create a new `.env` file in the project root:
   ```bash
   touch .env
   ```

3. Add your environment variables:
   ```bash
   # .env
   GITHUB_TOKEN=your_token_here
   YOUTUBE_API_KEY=your_key_here
   ```

### Loading Environment Variables

Synkra AIOS uses `dotenv` (if installed) or Node.js built-in environment variable support. Environment variables are automatically loaded from `.env` files in the project root.

**Important:** The `.env` file is gitignored and will never be committed to the repository.

## Security Best Practices

1. **Never commit `.env` files** - They are automatically gitignored
2. **Never commit API keys or secrets** - Use environment variables instead
3. **Use different values for development and production** - Create `.env.development` and `.env.production` files
4. **Rotate secrets regularly** - Especially if they may have been exposed
5. **Use secret management tools** - For production deployments, consider using services like:
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - GitHub Secrets (for CI/CD)

## CI/CD Environment Variables

For GitHub Actions and other CI/CD pipelines, use the platform's secret management:

### GitHub Actions

```yaml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  CUSTOM_SECRET: ${{ secrets.CUSTOM_SECRET }}
```

### Other CI/CD Platforms

Refer to your platform's documentation for secret management:
- **GitLab CI:** Use GitLab CI/CD variables
- **CircleCI:** Use CircleCI environment variables
- **Jenkins:** Use Jenkins credentials

## Troubleshooting

### Environment Variables Not Loading

1. Check that `.env` file exists in the project root
2. Verify `.env` file syntax (no spaces around `=`)
3. Restart your development server/process
4. Check that `dotenv` is installed (if required)

### Missing Environment Variables

If you see errors about missing environment variables:
1. Check this document for required variables
2. Check Squad documentation
3. Verify `.env` file contains all necessary variables
4. Ensure `.env` file is in the correct location (project root)

## Contributing

When adding new environment variables:
1. Document them in this file
2. Add them to `.env.example` (if creating one)
3. Update relevant documentation
4. Ensure `.env` is in `.gitignore`

---

**Last Updated:** 2025-11-12  
**Story:** 4.8 - Repository Open-Source Migration

