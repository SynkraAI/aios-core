/**
 * Evasion Test Suite — Governance Hooks Bash Filtering
 *
 * Story: E7.1.4 (AC5)
 * Validates that ALL evasion patterns listed in AC4 are detected and blocked.
 * 10+ test cases per blocked command.
 *
 * Uses Node.js built-in test runner (node --test).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGovernanceHooks } from '../src/governance-hooks.mjs';
import { loadRegistry } from '../src/registry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REGISTRY_PATH = resolve(__dirname, '..', 'agent-registry.json');
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');

// Load real registry
const registry = loadRegistry(REGISTRY_PATH, PROJECT_ROOT);
const hooks = createGovernanceHooks(registry);

// ---------------------------------------------------------------------------
// Helper: run preToolUse for Bash command and return decision
// ---------------------------------------------------------------------------

async function checkBash(agentId, command) {
  const agentHooks = hooks.forAgent(agentId);
  return agentHooks.preToolUse('Bash', { command });
}

async function expectDeny(agentId, command, description) {
  const result = await checkBash(agentId, command);
  assert.equal(
    result.decision,
    'deny',
    `Expected DENY for ${agentId}: "${command}" (${description}), got ${result.decision}`
  );
}

async function expectAllow(agentId, command, description) {
  const result = await checkBash(agentId, command);
  assert.equal(
    result.decision,
    'allow',
    `Expected ALLOW for ${agentId}: "${command}" (${description}), got ${result.decision}. Reason: ${result.reason || 'none'}`
  );
}

// ============================================================================
// @dev agent — blocked: ["git push", "gh pr create", "gh pr merge", "git push --force"]
// ============================================================================

describe('Evasion Tests: @dev agent', () => {
  const agent = 'dev';

  // ---- git push ----

  describe('blocked command: git push', () => {
    it('direct: git push', async () => {
      await expectDeny(agent, 'git push', 'direct match');
    });

    it('direct with remote: git push origin main', async () => {
      await expectDeny(agent, 'git push origin main', 'direct with args');
    });

    it('case-insensitive: GIT PUSH', async () => {
      await expectDeny(agent, 'GIT PUSH', 'case-insensitive');
    });

    it('case-insensitive: Git Push', async () => {
      await expectDeny(agent, 'Git Push', 'mixed case');
    });

    it('multiple spaces: git    push', async () => {
      await expectDeny(agent, 'git    push', 'multiple spaces');
    });

    it('tab whitespace: git\\tpush', async () => {
      await expectDeny(agent, 'git\tpush', 'tab character');
    });

    it('path-prefixed: /usr/bin/git push', async () => {
      await expectDeny(agent, '/usr/bin/git push', 'path-prefixed /usr/bin/');
    });

    it('path-prefixed: /usr/local/bin/git push', async () => {
      await expectDeny(agent, '/usr/local/bin/git push', 'path-prefixed /usr/local/bin/');
    });

    it('path-prefixed: /bin/git push', async () => {
      await expectDeny(agent, '/bin/git push', 'path-prefixed /bin/');
    });

    it('path traversal: ../../usr/bin/git push', async () => {
      await expectDeny(agent, '../../usr/bin/git push', 'path traversal');
    });

    it('backslash-escaped: gi\\t pu\\sh', async () => {
      await expectDeny(agent, 'gi\\t pu\\sh', 'backslash-escaped');
    });

    it('quote-split: gi"t" pu"sh"', async () => {
      await expectDeny(agent, 'gi"t" pu"sh"', 'quote-split double');
    });

    it("quote-split: gi't' pu'sh'", async () => {
      await expectDeny(agent, "gi't' pu'sh'", 'quote-split single');
    });

    it('eval wrapper: eval "git push"', async () => {
      await expectDeny(agent, 'eval "git push"', 'eval wrapper');
    });

    it("eval wrapper: eval 'git push'", async () => {
      await expectDeny(agent, "eval 'git push'", 'eval wrapper single-quote');
    });

    it('bash -c: bash -c "git push"', async () => {
      await expectDeny(agent, 'bash -c "git push"', 'bash -c');
    });

    it('sh -c: sh -c "git push"', async () => {
      await expectDeny(agent, 'sh -c "git push"', 'sh -c');
    });

    it('base64 decode piped to bash: echo "Z2l0IHB1c2g=" | base64 -d | bash', async () => {
      await expectDeny(
        agent,
        'echo "Z2l0IHB1c2g=" | base64 -d | bash',
        'base64 decode pipe bash'
      );
    });

    it('base64 decode piped to sh: echo "Z2l0IHB1c2g=" | base64 --decode | sh', async () => {
      await expectDeny(
        agent,
        'echo "Z2l0IHB1c2g=" | base64 --decode | sh',
        'base64 decode pipe sh'
      );
    });

    it('heredoc injection: bash <<< "git push"', async () => {
      await expectDeny(agent, 'bash <<< "git push"', 'heredoc here-string');
    });

    it('heredoc injection: bash << EOF\\ngit push\\nEOF', async () => {
      await expectDeny(agent, 'bash << EOF\ngit push\nEOF', 'heredoc standard');
    });

    it('heredoc with custom delimiter: bash << MYDELIM', async () => {
      await expectDeny(agent, 'bash << MYDELIM\ngit push\nMYDELIM', 'heredoc custom delimiter');
    });

    it('variable interpolation: G=git;P=push;$G $P', async () => {
      await expectDeny(agent, 'G=git;P=push;$G $P', 'variable interpolation short vars');
    });

    it('subshell dollar: $(git push)', async () => {
      await expectDeny(agent, '$(git push)', 'subshell dollar');
    });

    it('subshell backtick: `git push`', async () => {
      await expectDeny(agent, '`git push`', 'subshell backtick');
    });

    it('chained command: echo hello && git push', async () => {
      await expectDeny(agent, 'echo hello && git push', 'chained with &&');
    });

    it('piped command: echo test | git push', async () => {
      await expectDeny(agent, 'echo test | git push', 'piped');
    });

    it('semicolon chain: ls; git push', async () => {
      await expectDeny(agent, 'ls; git push', 'semicolon chain');
    });
  });

  // ---- git push --force ----

  describe('blocked command: git push --force', () => {
    it('direct: git push --force', async () => {
      await expectDeny(agent, 'git push --force', 'direct');
    });

    it('case-insensitive: GIT PUSH --FORCE', async () => {
      await expectDeny(agent, 'GIT PUSH --FORCE', 'case-insensitive');
    });

    it('with extra spaces: git  push  --force', async () => {
      await expectDeny(agent, 'git  push  --force', 'extra spaces');
    });

    it('path-prefixed: /usr/bin/git push --force', async () => {
      await expectDeny(agent, '/usr/bin/git push --force', 'path-prefixed');
    });

    it('with remote: git push --force origin main', async () => {
      await expectDeny(agent, 'git push --force origin main', 'with remote args');
    });

    it('also catches via git push pattern: git push -f', async () => {
      // git push -f should be caught by the "git push" pattern (it contains "git push")
      await expectDeny(agent, 'git push -f', 'short force flag caught by git push pattern');
    });

    it('eval: eval "git push --force"', async () => {
      await expectDeny(agent, 'eval "git push --force"', 'eval wrapper');
    });

    it('bash -c: bash -c "git push --force"', async () => {
      await expectDeny(agent, 'bash -c "git push --force"', 'bash -c');
    });

    it('subshell: $(git push --force)', async () => {
      await expectDeny(agent, '$(git push --force)', 'subshell');
    });

    it('backtick: `git push --force`', async () => {
      await expectDeny(agent, '`git push --force`', 'backtick subshell');
    });
  });

  // ---- gh pr create ----

  describe('blocked command: gh pr create', () => {
    it('direct: gh pr create', async () => {
      await expectDeny(agent, 'gh pr create', 'direct');
    });

    it('with flags: gh pr create --title "test" --body "body"', async () => {
      await expectDeny(agent, 'gh pr create --title "test" --body "body"', 'with flags');
    });

    it('case-insensitive: GH PR CREATE', async () => {
      await expectDeny(agent, 'GH PR CREATE', 'case-insensitive');
    });

    it('extra spaces: gh  pr  create', async () => {
      await expectDeny(agent, 'gh  pr  create', 'extra spaces');
    });

    it('path-prefixed: /usr/bin/gh pr create', async () => {
      await expectDeny(agent, '/usr/bin/gh pr create', 'path-prefixed');
    });

    it('path-prefixed: /usr/local/bin/gh pr create', async () => {
      await expectDeny(agent, '/usr/local/bin/gh pr create', 'path-prefixed local');
    });

    it('backslash-escaped: g\\h p\\r c\\reate', async () => {
      await expectDeny(agent, 'g\\h p\\r c\\reate', 'backslash-escaped');
    });

    it('eval wrapper: eval "gh pr create"', async () => {
      await expectDeny(agent, 'eval "gh pr create"', 'eval');
    });

    it('bash -c: bash -c "gh pr create"', async () => {
      await expectDeny(agent, 'bash -c "gh pr create"', 'bash -c');
    });

    it('subshell: $(gh pr create)', async () => {
      await expectDeny(agent, '$(gh pr create)', 'subshell');
    });

    it('backtick: `gh pr create`', async () => {
      await expectDeny(agent, '`gh pr create`', 'backtick');
    });

    it('chained: echo test && gh pr create', async () => {
      await expectDeny(agent, 'echo test && gh pr create', 'chained');
    });
  });

  // ---- gh pr merge ----

  describe('blocked command: gh pr merge', () => {
    it('direct: gh pr merge', async () => {
      await expectDeny(agent, 'gh pr merge', 'direct');
    });

    it('with PR number: gh pr merge 123', async () => {
      await expectDeny(agent, 'gh pr merge 123', 'with number');
    });

    it('case-insensitive: GH PR MERGE', async () => {
      await expectDeny(agent, 'GH PR MERGE', 'case-insensitive');
    });

    it('extra spaces: gh   pr   merge', async () => {
      await expectDeny(agent, 'gh   pr   merge', 'extra spaces');
    });

    it('path-prefixed: /usr/bin/gh pr merge', async () => {
      await expectDeny(agent, '/usr/bin/gh pr merge', 'path-prefixed');
    });

    it('eval: eval "gh pr merge"', async () => {
      await expectDeny(agent, 'eval "gh pr merge"', 'eval');
    });

    it('bash -c: bash -c "gh pr merge"', async () => {
      await expectDeny(agent, 'bash -c "gh pr merge"', 'bash -c');
    });

    it('subshell: $(gh pr merge)', async () => {
      await expectDeny(agent, '$(gh pr merge)', 'subshell');
    });

    it('backtick: `gh pr merge`', async () => {
      await expectDeny(agent, '`gh pr merge`', 'backtick');
    });

    it('heredoc: bash <<< "gh pr merge"', async () => {
      await expectDeny(agent, 'bash <<< "gh pr merge"', 'here-string');
    });
  });

  // ---- Legitimate commands that must NOT be blocked ----

  describe('legitimate commands: must ALLOW', () => {
    it('git status', async () => {
      await expectAllow(agent, 'git status', 'git status');
    });

    it('git add .', async () => {
      await expectAllow(agent, 'git add .', 'git add');
    });

    it('git add -A', async () => {
      await expectAllow(agent, 'git add -A', 'git add -A');
    });

    it('git commit -m "feat: something"', async () => {
      await expectAllow(agent, 'git commit -m "feat: something"', 'git commit');
    });

    it('git diff', async () => {
      await expectAllow(agent, 'git diff', 'git diff');
    });

    it('git diff --stat', async () => {
      await expectAllow(agent, 'git diff --stat', 'git diff stat');
    });

    it('git log --oneline -10', async () => {
      await expectAllow(agent, 'git log --oneline -10', 'git log');
    });

    it('git branch -a', async () => {
      await expectAllow(agent, 'git branch -a', 'git branch');
    });

    it('git checkout -b feat/new-feature', async () => {
      await expectAllow(agent, 'git checkout -b feat/new-feature', 'git checkout');
    });

    it('git stash', async () => {
      await expectAllow(agent, 'git stash', 'git stash');
    });

    it('git merge feature-branch', async () => {
      await expectAllow(agent, 'git merge feature-branch', 'git merge');
    });

    it('npm test', async () => {
      await expectAllow(agent, 'npm test', 'npm test');
    });

    it('npm run lint', async () => {
      await expectAllow(agent, 'npm run lint', 'npm run lint');
    });

    it('node --test tests/', async () => {
      await expectAllow(agent, 'node --test tests/', 'node test runner');
    });

    it('ls -la', async () => {
      await expectAllow(agent, 'ls -la', 'ls');
    });

    it('echo "hello world"', async () => {
      await expectAllow(agent, 'echo "hello world"', 'echo');
    });

    it('cat package.json', async () => {
      await expectAllow(agent, 'cat package.json', 'cat');
    });

    it('cd /home/ubuntu && npm test', async () => {
      await expectAllow(agent, 'cd /home/ubuntu && npm test', 'cd and npm');
    });

    it('git remote -v (read-only remote info)', async () => {
      await expectAllow(agent, 'git remote -v', 'git remote');
    });

    it('gh pr list (list, not create)', async () => {
      await expectAllow(agent, 'gh pr list', 'gh pr list');
    });

    it('gh pr view 123 (view, not merge)', async () => {
      await expectAllow(agent, 'gh pr view 123', 'gh pr view');
    });

    it('gh issue list', async () => {
      await expectAllow(agent, 'gh issue list', 'gh issue list');
    });

    it('git pull origin main (pull is allowed)', async () => {
      await expectAllow(agent, 'git pull origin main', 'git pull');
    });

    it('grep -r "push" src/ (word push in search is fine)', async () => {
      await expectAllow(agent, 'grep -r "push" src/', 'grep with push keyword');
    });
  });
});

// ============================================================================
// @qa agent — blocked: ["git push", "gh pr create", "gh pr merge"]
// ============================================================================

describe('Evasion Tests: @qa agent', () => {
  const agent = 'qa';

  describe('blocked command: git push', () => {
    it('direct: git push', async () => {
      await expectDeny(agent, 'git push', 'direct');
    });

    it('case-insensitive: GIT PUSH', async () => {
      await expectDeny(agent, 'GIT PUSH', 'case-insensitive');
    });

    it('multiple spaces: git    push', async () => {
      await expectDeny(agent, 'git    push', 'multiple spaces');
    });

    it('path-prefixed: /usr/bin/git push', async () => {
      await expectDeny(agent, '/usr/bin/git push', 'path-prefixed');
    });

    it('eval wrapper: eval "git push"', async () => {
      await expectDeny(agent, 'eval "git push"', 'eval');
    });

    it('base64: echo "Z2l0IHB1c2g=" | base64 -d | bash', async () => {
      await expectDeny(agent, 'echo "Z2l0IHB1c2g=" | base64 -d | bash', 'base64');
    });

    it('bash -c: bash -c "git push"', async () => {
      await expectDeny(agent, 'bash -c "git push"', 'bash -c');
    });

    it('subshell: $(git push)', async () => {
      await expectDeny(agent, '$(git push)', 'subshell');
    });

    it('backslash-escaped: gi\\t pu\\sh', async () => {
      await expectDeny(agent, 'gi\\t pu\\sh', 'backslash-escaped');
    });

    it('heredoc: bash <<< "git push"', async () => {
      await expectDeny(agent, 'bash <<< "git push"', 'here-string');
    });
  });

  describe('blocked command: gh pr create', () => {
    it('direct: gh pr create', async () => {
      await expectDeny(agent, 'gh pr create', 'direct');
    });

    it('bash -c: bash -c "gh pr create"', async () => {
      await expectDeny(agent, 'bash -c "gh pr create"', 'bash -c');
    });

    it('path-prefixed: /usr/local/bin/gh pr create', async () => {
      await expectDeny(agent, '/usr/local/bin/gh pr create', 'path-prefixed');
    });

    it('eval: eval "gh pr create"', async () => {
      await expectDeny(agent, 'eval "gh pr create"', 'eval');
    });

    it('subshell: $(gh pr create)', async () => {
      await expectDeny(agent, '$(gh pr create)', 'subshell');
    });

    it('backtick: `gh pr create`', async () => {
      await expectDeny(agent, '`gh pr create`', 'backtick');
    });

    it('extra spaces: gh   pr   create', async () => {
      await expectDeny(agent, 'gh   pr   create', 'extra spaces');
    });

    it('case-insensitive: Gh Pr Create', async () => {
      await expectDeny(agent, 'Gh Pr Create', 'mixed case');
    });

    it('chained: ls && gh pr create', async () => {
      await expectDeny(agent, 'ls && gh pr create', 'chained');
    });

    it('with heredoc: bash << EOF\ngh pr create\nEOF', async () => {
      await expectDeny(agent, 'bash << EOF\ngh pr create\nEOF', 'heredoc');
    });
  });

  describe('blocked command: gh pr merge', () => {
    it('direct: gh pr merge', async () => {
      await expectDeny(agent, 'gh pr merge', 'direct');
    });

    it('with number: gh pr merge 42', async () => {
      await expectDeny(agent, 'gh pr merge 42', 'with PR number');
    });

    it('eval: eval "gh pr merge"', async () => {
      await expectDeny(agent, 'eval "gh pr merge"', 'eval');
    });

    it('bash -c: sh -c "gh pr merge"', async () => {
      await expectDeny(agent, 'sh -c "gh pr merge"', 'sh -c');
    });

    it('subshell: $(gh pr merge)', async () => {
      await expectDeny(agent, '$(gh pr merge)', 'subshell');
    });

    it('path-prefixed: /usr/bin/gh pr merge', async () => {
      await expectDeny(agent, '/usr/bin/gh pr merge', 'path-prefixed');
    });

    it('case-insensitive: GH PR MERGE', async () => {
      await expectDeny(agent, 'GH PR MERGE', 'case-insensitive');
    });

    it('multiple spaces: gh  pr  merge', async () => {
      await expectDeny(agent, 'gh  pr  merge', 'extra spaces');
    });

    it('chained: npm test; gh pr merge', async () => {
      await expectDeny(agent, 'npm test; gh pr merge', 'semicolon chain');
    });

    it('backtick: `gh pr merge 99`', async () => {
      await expectDeny(agent, '`gh pr merge 99`', 'backtick with number');
    });
  });

  describe('legitimate commands: must ALLOW', () => {
    it('git status', async () => {
      await expectAllow(agent, 'git status', 'git status');
    });

    it('git diff', async () => {
      await expectAllow(agent, 'git diff', 'git diff');
    });

    it('git log --oneline', async () => {
      await expectAllow(agent, 'git log --oneline', 'git log');
    });

    it('npm test', async () => {
      await expectAllow(agent, 'npm test', 'npm test');
    });

    it('gh pr list', async () => {
      await expectAllow(agent, 'gh pr list', 'gh pr list');
    });

    it('gh pr view 123', async () => {
      await expectAllow(agent, 'gh pr view 123', 'gh pr view');
    });
  });
});

// ============================================================================
// @data-engineer agent — blocked: ["git push", "gh pr create", "gh pr merge"]
// ============================================================================

describe('Evasion Tests: @data-engineer agent', () => {
  const agent = 'data-engineer';

  describe('blocked command: git push', () => {
    it('direct: git push', async () => {
      await expectDeny(agent, 'git push', 'direct');
    });

    it('path-prefixed: /usr/bin/git push', async () => {
      await expectDeny(agent, '/usr/bin/git push', 'path-prefixed');
    });

    it('bash -c: bash -c "git push"', async () => {
      await expectDeny(agent, 'bash -c "git push"', 'bash -c');
    });

    it('eval: eval "git push"', async () => {
      await expectDeny(agent, 'eval "git push"', 'eval');
    });

    it('subshell: $(git push)', async () => {
      await expectDeny(agent, '$(git push)', 'subshell');
    });

    it('base64: echo "Z2l0IHB1c2g=" | base64 -d | bash', async () => {
      await expectDeny(agent, 'echo "Z2l0IHB1c2g=" | base64 -d | bash', 'base64');
    });

    it('heredoc: bash <<< "git push"', async () => {
      await expectDeny(agent, 'bash <<< "git push"', 'here-string');
    });

    it('backslash: gi\\t pu\\sh', async () => {
      await expectDeny(agent, 'gi\\t pu\\sh', 'backslash');
    });

    it('case-insensitive: GIT PUSH', async () => {
      await expectDeny(agent, 'GIT PUSH', 'case-insensitive');
    });

    it('multiple spaces: git   push', async () => {
      await expectDeny(agent, 'git   push', 'extra spaces');
    });
  });

  describe('legitimate commands: must ALLOW', () => {
    it('psql -c "SELECT 1"', async () => {
      await expectAllow(agent, 'psql -c "SELECT 1"', 'psql');
    });

    it('supabase db push', async () => {
      await expectAllow(agent, 'supabase db push', 'supabase db push');
    });

    it('npm run migrate', async () => {
      await expectAllow(agent, 'npm run migrate', 'npm migrate');
    });

    it('git status', async () => {
      await expectAllow(agent, 'git status', 'git status');
    });

    it('git diff', async () => {
      await expectAllow(agent, 'git diff', 'git diff');
    });
  });
});

// ============================================================================
// @devops agent — NO bash restrictions (full authority)
// ============================================================================

describe('Evasion Tests: @devops agent (no restrictions)', () => {
  const agent = 'devops';

  it('git push is ALLOWED for devops', async () => {
    await expectAllow(agent, 'git push', 'devops has full authority');
  });

  it('git push --force is ALLOWED for devops', async () => {
    await expectAllow(agent, 'git push --force', 'devops has full authority');
  });

  it('gh pr create is ALLOWED for devops', async () => {
    await expectAllow(agent, 'gh pr create', 'devops has full authority');
  });

  it('gh pr merge is ALLOWED for devops', async () => {
    await expectAllow(agent, 'gh pr merge', 'devops has full authority');
  });

  it('eval "any command" is ALLOWED for devops', async () => {
    await expectAllow(agent, 'eval "git push"', 'devops has no evasion restrictions');
  });

  it('base64 commands are ALLOWED for devops', async () => {
    await expectAllow(agent, 'echo "Z2l0IHB1c2g=" | base64 -d | bash', 'devops unrestricted');
  });
});

// ============================================================================
// @aios-master — forAgent returns null (no restrictions)
// ============================================================================

describe('Evasion Tests: @aios-master (null hooks)', () => {
  it('forAgent returns null for aios-master', () => {
    const result = hooks.forAgent('aios-master');
    assert.equal(result, null, 'aios-master should get null hooks');
  });
});

// ============================================================================
// Cross-cutting evasion patterns (tested against @dev)
// ============================================================================

describe('Cross-cutting Evasion Patterns', () => {
  const agent = 'dev';

  describe('base64 encoding with payload inspection', () => {
    it('base64 of "git push" piped to bash', async () => {
      // "git push" in base64 is "Z2l0IHB1c2g="
      await expectDeny(
        agent,
        'echo Z2l0IHB1c2g= | base64 -d | bash',
        'base64 payload contains blocked command'
      );
    });

    it('base64 of "gh pr create" piped to sh', async () => {
      // "gh pr create" in base64
      const encoded = Buffer.from('gh pr create').toString('base64');
      await expectDeny(
        agent,
        `echo ${encoded} | base64 --decode | sh`,
        'base64 gh pr create'
      );
    });

    it('base64 with quotes around payload', async () => {
      await expectDeny(
        agent,
        'echo "Z2l0IHB1c2g=" | base64 -d | bash',
        'base64 with quotes'
      );
    });
  });

  describe('eval variants', () => {
    it('eval with double-quote string', async () => {
      await expectDeny(agent, 'eval "git push origin main"', 'eval double-quote');
    });

    it('eval with single-quote string', async () => {
      await expectDeny(agent, "eval 'git push'", 'eval single-quote');
    });

    it('eval with subshell', async () => {
      await expectDeny(agent, 'eval $(echo "git push")', 'eval subshell');
    });
  });

  describe('bash -c / sh -c variants', () => {
    it('bash -c with double-quotes', async () => {
      await expectDeny(agent, 'bash -c "git push"', 'bash -c double');
    });

    it('sh -c with single-quotes', async () => {
      await expectDeny(agent, "sh -c 'git push'", 'sh -c single');
    });

    it('zsh -c with variable', async () => {
      await expectDeny(agent, 'zsh -c "$CMD"', 'zsh -c variable');
    });
  });

  describe('heredoc variants', () => {
    it('bash here-string (<<<)', async () => {
      await expectDeny(agent, 'bash <<< "git push"', 'here-string');
    });

    it('bash heredoc with EOF', async () => {
      await expectDeny(agent, 'bash << EOF\ngit push\nEOF', 'heredoc EOF');
    });

    it('sh heredoc with custom delimiter', async () => {
      await expectDeny(agent, 'sh << MYDELIM\ngit push\nMYDELIM', 'heredoc custom');
    });

    it('heredoc with quoted delimiter', async () => {
      await expectDeny(agent, "bash << 'SCRIPT'\ngit push\nSCRIPT", 'heredoc quoted');
    });

    it('heredoc with dash (strip tabs)', async () => {
      await expectDeny(agent, 'bash <<- END\ngit push\nEND', 'heredoc dash');
    });
  });

  describe('variable interpolation (N1 fix — narrowed pattern)', () => {
    it('single-char vars: $G $P', async () => {
      await expectDeny(agent, 'G=git;P=push;$G $P', 'single-char var interpolation');
    });

    it('legitimate long vars NOT blocked: cd $HOME && ls $PWD', async () => {
      // N1 fix: this should be ALLOWED because $HOME and $PWD are multi-char
      await expectAllow(agent, 'cd $HOME && ls $PWD', 'legitimate multi-char vars');
    });

    it('legitimate: export FOO=$BAR', async () => {
      await expectAllow(agent, 'export FOO=$BAR', 'var assignment');
    });

    it('legitimate: cp $SRC $DEST', async () => {
      await expectAllow(agent, 'cp $SRC $DEST', 'multi-char vars');
    });
  });

  describe('subshell variants', () => {
    it('dollar-paren: $(git push)', async () => {
      await expectDeny(agent, 'result=$(git push)', 'dollar-paren');
    });

    it('backtick: `git push origin main`', async () => {
      await expectDeny(agent, '`git push origin main`', 'backtick');
    });

    it('nested: echo $(git push)', async () => {
      await expectDeny(agent, 'echo $(git push)', 'nested subshell');
    });
  });

  describe('path-qualified binary', () => {
    it('/usr/bin/git push', async () => {
      await expectDeny(agent, '/usr/bin/git push', '/usr/bin/');
    });

    it('/usr/local/bin/git push', async () => {
      await expectDeny(agent, '/usr/local/bin/git push', '/usr/local/bin/');
    });

    it('/bin/git push', async () => {
      await expectDeny(agent, '/bin/git push', '/bin/');
    });

    it('../../usr/bin/git push (traversal)', async () => {
      await expectDeny(agent, '../../usr/bin/git push', 'path traversal');
    });

    it('../../../bin/git push (traversal)', async () => {
      await expectDeny(agent, '../../../bin/git push', 'deep traversal');
    });
  });

  describe('escaped characters', () => {
    it('backslash in command: gi\\t pu\\sh', async () => {
      await expectDeny(agent, 'gi\\t pu\\sh', 'backslash');
    });

    it('quotes around chars: g"i"t p"u"sh', async () => {
      await expectDeny(agent, 'g"i"t p"u"sh', 'quote-split');
    });

    it("single-quote split: g'i't p'u'sh", async () => {
      await expectDeny(agent, "g'i't p'u'sh", 'single-quote split');
    });
  });
});
