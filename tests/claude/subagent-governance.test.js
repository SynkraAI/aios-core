const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const yaml = require('js-yaml');

const repoRoot = path.resolve(__dirname, '..', '..');
const agentsDir = path.join(repoRoot, '.claude', 'agents');
const claudeAuthorityHookPath = path.join(
  repoRoot,
  '.claude',
  'hooks',
  'enforce-git-push-authority.cjs',
);
const grokAuthorityHookPath = path.join(
  repoRoot,
  '.grok',
  'hooks',
  'enforce-git-push-authority.cjs',
);
const canonicalAuthorityHookPath = path.join(
  repoRoot,
  '.aiox-core',
  'infrastructure',
  'templates',
  'grok-hooks',
  'enforce-git-push-authority.cjs',
);
const authorityHookPaths = [claudeAuthorityHookPath, grokAuthorityHookPath].filter((p) =>
  fs.existsSync(p),
);
const allowedColors = new Set(['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']);
const expectedCoreNativeSubagents = [
  'aiox-analyst.md',
  'aiox-architect.md',
  'aiox-data-engineer.md',
  'aiox-dev.md',
  'aiox-devops.md',
  'aiox-pm.md',
  'aiox-po.md',
  'aiox-qa.md',
  'aiox-sm.md',
  'aiox-ux.md',
];

function readFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  return yaml.load(match[1]);
}

function runAuthorityHook(command, env = {}, hookPath = claudeAuthorityHookPath) {
  return spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify({
      hook_event_name: 'PreToolUse',
      tool_name: 'Bash',
      tool_input: { command },
    }),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

describe('Claude native subagent governance', () => {
  it('keeps Claude and Grok authority hooks equal to the canonical source', () => {
    const canonical = fs.readFileSync(canonicalAuthorityHookPath, 'utf8');
    for (const hookPath of authorityHookPaths) {
      expect(fs.readFileSync(hookPath, 'utf8')).toBe(canonical);
    }
  });

  it('keeps all native subagents compliant with supported frontmatter fields', () => {
    const onDisk = fs.readdirSync(agentsDir).filter(file => file.endsWith('.md')).sort();
    // Require every core native subagent to exist (authoritative set).
    // Ignore untracked/local leftovers (legacy short names, aios-*, etc.).
    for (const file of expectedCoreNativeSubagents) {
      expect(onDisk).toContain(file);
    }

    for (const file of expectedCoreNativeSubagents) {
      const frontmatter = readFrontmatter(path.join(agentsDir, file));

      expect(frontmatter).toBeTruthy();
      expect(frontmatter.name).toEqual(expect.stringMatching(/^[a-z0-9-]+$/));
      expect(frontmatter.description).toBeTruthy();
      expect(allowedColors.has(frontmatter.color)).toBe(true);
      expect(frontmatter.tools || []).not.toContain('Task');
    }
  });

  it('requires the remote Git authority hook for every non-devops bypass agent with Bash', () => {
    // Only enforce on the core set — local IDE leftovers may lack hooks frontmatter.
    for (const file of expectedCoreNativeSubagents) {
      const frontmatter = readFrontmatter(path.join(agentsDir, file));
      expect(frontmatter).toBeTruthy();
      const tools = frontmatter.tools || [];
      const isNonDevopsBypassBash =
        frontmatter.permissionMode === 'bypassPermissions' &&
        tools.includes('Bash') &&
        !['aiox-devops', 'devops', 'github-devops'].includes(frontmatter.name);

      if (isNonDevopsBypassBash) {
        expect(JSON.stringify(frontmatter.hooks)).toContain('enforce-git-push-authority.cjs');
      }
    }
  });

  it('registers the remote Git authority hook at project settings level', () => {
    const settings = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude', 'settings.json'), 'utf8'));
    const preToolUse = settings.hooks?.PreToolUse || [];

    expect(JSON.stringify(preToolUse)).toContain('enforce-git-push-authority.cjs');
    expect(preToolUse.some(entry => entry.matcher === 'Bash')).toBe(true);
  });

  it('uses shell-neutral project hook commands in committed Claude settings', () => {
    const settings = JSON.parse(fs.readFileSync(path.join(repoRoot, '.claude', 'settings.json'), 'utf8'));
    const commands = Object.values(settings.hooks || {})
      .flat()
      .flatMap(entry => entry.hooks || [])
      .map(hook => hook.command);

    expect(commands).toEqual(expect.arrayContaining([
      'node .claude/hooks/synapse-wrapper.cjs',
      'node .claude/hooks/precompact-wrapper.cjs',
      'node .claude/hooks/enforce-git-push-authority.cjs',
    ]));

    for (const command of commands) {
      expect(command).not.toContain('CLAUDE_PROJECT_DIR');
      expect(command).not.toContain('${');
      expect(command).toMatch(/^node \.claude\/hooks\/[-a-z]+\.cjs$/);
    }
  });

  it('blocks remote GitHub operations outside devops and allows devops-tagged commands', () => {
    const blockedCommands = [
      'git push origin main',
      'gh pr create --title test --body test',
      'gh pr merge 123 --admin',
      // Global-flag bypass forms (git accepts options between `git` and subcommand)
      'git -C /repo push origin main',
      'git -c user.name=x push origin main',
      'git --git-dir=/repo/work push',
      'git --work-tree=/x -C /repo push --force',
      // gh flags before/between subcommands
      'gh --repo owner/repo pr create --title test',
      'gh pr -R owner/repo merge 12',
      // PR mutations through the REST API
      'gh api repos/owner/repo/pulls -f title=t -f head=h -f base=main',
      'gh api -X POST repos/owner/repo/pulls --input body.json',
      'gh api --method PUT repos/owner/repo/pulls/1/merge',
      "gh api graphql -f query='mutation { createPullRequest(input: {}) { pullRequest { id } } }'",
      "gh --repo owner/repo api graphql -f query='mutation { mergePullRequest(input: {}) { pullRequest { merged } } }'",
    ];

    for (const command of blockedCommands) {
      const result = runAuthorityHook(command, { AIOX_ACTIVE_AGENT: 'dev' });
      // Deny paths emit a decision payload and exit 2 for fail-closed hosts.
      expect(result.status).toBe(2);
      const decision = JSON.parse(result.stdout);
      expect(decision.hookSpecificOutput.permissionDecision).toBe('deny');
      // Dual payload for Grok Build PreToolUse
      expect(decision.decision).toBe('deny');
      expect(decision.reason).toMatch(/@devops/);
    }

    const allowed = runAuthorityHook('git push origin main', { AIOX_ACTIVE_AGENT: 'devops' });
    expect(allowed.status).toBe(0);
    expect(allowed.stdout).toBe('');
  });

  it('keeps non-publication commands allowed for non-devops agents', () => {
    const allowedCommands = [
      'git commit -m "push later"',
      'git checkout push-fix',
      'git log --oneline -10',
      'gh pr list --search merge',
      'gh pr view 123',
      // Read-only API access to pull endpoints stays allowed
      'gh api repos/owner/repo/pulls',
      'gh api repos/owner/repo/pulls --paginate',
      "gh api graphql -f query='{ repository(owner: \"o\", name: \"r\") { pullRequests(first: 1) { totalCount } } }'",
      'gh issue create --title test',
    ];

    for (const command of allowedCommands) {
      const result = runAuthorityHook(command, { AIOX_ACTIVE_AGENT: 'dev' });
      expect(result.status).toBe(0);
      expect(result.stdout).toBe('');
    }
  });

  it('fails closed on empty stdin and malformed JSON', () => {
    for (const hookPath of authorityHookPaths) {
      const emptyStdin = spawnSync(process.execPath, [hookPath], {
        input: '',
        encoding: 'utf8',
        env: { ...process.env, AIOX_ACTIVE_AGENT: 'dev' },
      });
      expect(emptyStdin.status).toBe(2);
      const emptyDecision = JSON.parse(emptyStdin.stdout);
      expect(emptyDecision.decision).toBe('deny');
      expect(emptyDecision.hookSpecificOutput.permissionDecision).toBe('deny');

      const malformed = spawnSync(process.execPath, [hookPath], {
        input: '{not json',
        encoding: 'utf8',
        env: { ...process.env, AIOX_ACTIVE_AGENT: 'dev' },
      });
      expect(malformed.status).toBe(2);
      const decision = JSON.parse(malformed.stdout);
      expect(decision.decision).toBe('deny');
      expect(decision.hookSpecificOutput.permissionDecision).toBe('deny');
    }
  });

  it('blocks remote ops on Grok-native toolInput payloads (camelCase) for both hooks', () => {
    expect(authorityHookPaths.length).toBeGreaterThanOrEqual(2);

    for (const hookPath of authorityHookPaths) {
      const result = spawnSync(process.execPath, [hookPath], {
        input: JSON.stringify({
          hookEventName: 'pre_tool_use',
          toolName: 'run_terminal_command',
          toolInput: { command: 'git push origin main' },
          cwd: os.tmpdir(),
          workspaceRoot: os.tmpdir(),
        }),
        encoding: 'utf8',
        env: { ...process.env, AIOX_ACTIVE_AGENT: 'dev' },
      });

      expect(result.status).toBe(2);
      const decision = JSON.parse(result.stdout);
      expect(decision.decision).toBe('deny');
      expect(decision.hookSpecificOutput.permissionDecision).toBe('deny');
    }
  });

  it('allows remote ops when Grok active-agent bridge identifies devops (both hooks)', () => {
    expect(authorityHookPaths.length).toBeGreaterThanOrEqual(2);

    for (const hookPath of authorityHookPaths) {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-gov-bridge-'));
      fs.mkdirSync(path.join(tmp, '.aiox'), { recursive: true });
      fs.writeFileSync(path.join(tmp, '.aiox', 'active-agent'), 'devops\n');

      const env = { ...process.env };
      for (const key of [
        'AIOX_ACTIVE_AGENT',
        'AIOX_AGENT',
        'ACTIVE_AGENT',
        'CLAUDE_AGENT_NAME',
        'CLAUDE_CODE_AGENT',
        'AIOX_CURRENT_AGENT',
        'GROK_ACTIVE_AGENT',
      ]) {
        delete env[key];
      }

      const result = spawnSync(process.execPath, [hookPath], {
        input: JSON.stringify({
          toolInput: { command: 'git push origin main' },
          cwd: tmp,
          workspaceRoot: tmp,
        }),
        encoding: 'utf8',
        env,
      });

      expect(result.status).toBe(0);
      expect(result.stdout).toBe('');
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  it('rejects stale active-agent bridges (leftover devops from an old session)', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aiox-gov-stale-'));
    fs.mkdirSync(path.join(tmp, '.aiox'), { recursive: true });
    const bridgePath = path.join(tmp, '.aiox', 'active-agent');
    fs.writeFileSync(bridgePath, 'devops\n');
    // Backdate past the 8h bridge TTL
    const staleSeconds = (Date.now() - 9 * 60 * 60 * 1000) / 1000;
    fs.utimesSync(bridgePath, staleSeconds, staleSeconds);

    const env = { ...process.env };
    for (const key of [
      'AIOX_ACTIVE_AGENT',
      'AIOX_AGENT',
      'ACTIVE_AGENT',
      'CLAUDE_AGENT_NAME',
      'CLAUDE_CODE_AGENT',
      'AIOX_CURRENT_AGENT',
      'GROK_ACTIVE_AGENT',
    ]) {
      delete env[key];
    }

    const result = spawnSync(process.execPath, [claudeAuthorityHookPath], {
      input: JSON.stringify({
        toolInput: { command: 'git push origin main' },
        cwd: tmp,
        workspaceRoot: tmp,
      }),
      encoding: 'utf8',
      env,
    });

    expect(result.status).toBe(2);
    const decision = JSON.parse(result.stdout);
    expect(decision.decision).toBe('deny');
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
