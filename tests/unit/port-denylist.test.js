'use strict';

const path = require('path');
const {
  scanContent,
  scanProject,
  isAllowlisted,
  DENY_PATTERNS,
  DEFAULT_SCAN_ROOTS,
} = require('../../.aiox-core/core/security/port-denylist');

describe('port-denylist (CORE-SU.A4)', () => {
  it('exposes deny patterns including workspace product and sinkra', () => {
    const ids = DENY_PATTERNS.map((p) => p.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'workspace-product',
        'secrets-path',
        'hardcoded-credential',
        'sinkra-prefix',
        'mux-adapter',
        'machine-path-users',
      ]),
    );
  });

  it('flags sinkra_ and workspace product paths', () => {
    const hits = scanContent(
      'require("sinkra_pipeline")\nworkspace/custom-domain/foo\n`workspace/private-api`',
    );
    expect(hits.some((h) => h.id === 'sinkra-prefix')).toBe(true);
    expect(hits.filter((h) => h.id === 'workspace-product')).toHaveLength(2);
  });

  it('flags secret-store paths and probable hardcoded credentials', () => {
    const hits = scanContent(
      'secrets/api-key\napi_key = "abcdefghijklmnop123456"',
    );
    expect(hits.some((h) => h.id === 'secrets-path')).toBe(true);
    expect(hits.some((h) => h.id === 'hardcoded-credential')).toBe(true);
  });

  it.each([
    ['API_KEY=abcdefghijklmnop123456', '.env'],
    ['password: abcdefghijklmnop123456', 'config.yaml'],
    ['auth-token = abcdefghijklmnop123456 # local override', 'secrets.env'],
    ['client_secret: "abcdefghijklmnop123456"', 'config.yml'],
    ['{"api_key":"abcdefghijklmnop123456"}', 'config.json'],
    ["'password': 'abcdefghijklmnop123456'", 'config.yaml'],
    ['const password = "abcdefghijklmnop123456";', 'config.js'],
  ])('flags quoted keys and literal credential assignment %j', (line, filePath) => {
    expect(scanContent(line, filePath)).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'hardcoded-credential' })]),
    );
  });

  it('honors literal boundaries around unquoted credentials', () => {
    expect(scanContent('API_KEY=abcdefghijklmnop123456; enabled=true')).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'hardcoded-credential' })]),
    );
    expect(scanContent('API_KEY=abcdefghijklmnop123456${PASSWORD}')).toHaveLength(0);
  });

  it.each([
    'export PASSWORD=abcdEFGHijklMNOP1234',
    'password: "Correct Horse!@:% 123456"',
    'API_KEY=abcdEFGH!@:%ijklMNOP1234',
  ])('detects the required high-entropy literal vector: %s', (line) => {
    expect(scanContent(line)).toEqual([
      expect.objectContaining({ id: 'hardcoded-credential' }),
    ]);
  });

  it('continues scanning after a dynamic assignment on the same line', () => {
    const hits = scanContent(
      '{"password":"${PASSWORD}","api_key":"abcdefghijklmnop123456"}',
      'config.json',
    );

    expect(hits).toEqual([
      expect.objectContaining({ id: 'hardcoded-credential' }),
    ]);
  });

  it('does not consume the next assignment after a delimiter', () => {
    const hits = scanContent(
      'PASSWORD=$PASSWORD, API_KEY=abcdEFGH!@:%ijklMNOP1234',
      '.env',
    );

    expect(hits).toEqual([
      expect.objectContaining({ id: 'hardcoded-credential' }),
    ]);
  });

  it.each([
    'const apiKey = process.env.OPENAI_API_KEY;',
    'PASSWORD=process.env.PASSWORD',
    'export PASSWORD=$PASSWORD',
    'const accessToken = getLicenseResultAccessToken(result);',
    'password: options.password || process.env.PASSWORD,',
    'password: getPassword(),',
    'password: vault.getPassword(),',
    'password: vault["password"],',
    'password: passwordTemplate',
    'password: `abcdefghijklmnop${PASSWORD}`',
    '"password": "${PASSWORD}"',
    '"password": "process.env.PASSWORD"',
    '{"password":"${PASSWORD}","api_key":"process.env.API_KEY"}',
    'PASSWORD=getPassword(); API_KEY=resolveApiKey()',
    'PASSWORD=`prefix-${PASSWORD}`; API_KEY="${API_KEY}"',
  ])('does not classify credential references as hardcoded values: %s', (line) => {
    expect(scanContent(line).some((hit) => hit.id === 'hardcoded-credential')).toBe(false);
  });

  it('preserves credential detection in the QA security checklist', () => {
    const qaChecklist = path.join(
      '.aiox-core',
      'development',
      'tasks',
      'qa-security-checklist.md',
    );
    const hits = scanContent(
      'api_key = "abcdefghijklmnop123456"',
      qaChecklist,
    );
    expect(hits).toEqual([
      expect.objectContaining({ id: 'hardcoded-credential' }),
    ]);
  });

  it('flags machine absolute paths', () => {
    const hits = scanContent('const p = "/Users/alan/Code/secret"');
    expect(hits.some((h) => h.id === 'machine-path-users')).toBe(true);
  });

  it('allows clean OSS code', () => {
    const hits = scanContent('const x = require(".aiox-core/core/permissions")');
    expect(hits).toHaveLength(0);
  });

  it('allowlists denylist self-docs', () => {
    expect(
      isAllowlisted(path.join('docs', 'framework', 'epics', 'core-super-update', 'EPIC.md')),
    ).toBe(true);
    expect(isAllowlisted(path.join('src', 'foo.js'))).toBe(false);
  });

  it('scans tracked agent config surfaces by default', () => {
    expect(DEFAULT_SCAN_ROOTS).toEqual(
      expect.arrayContaining(['.claude', '.codex', '.gemini', '.grok']),
    );
  });

  it('fails closed when an explicit file cannot be read', () => {
    const result = scanProject({
      projectRoot: path.resolve(__dirname, '../..'),
      files: ['missing-port-denylist-fixture.js'],
    });
    expect(result.ok).toBe(false);
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'scan-error',
          file: 'missing-port-denylist-fixture.js',
        }),
      ]),
    );
  });

  it('scanProject on this repo is clean (or only documents hits)', () => {
    const result = scanProject({ projectRoot: path.resolve(__dirname, '../..') });
    expect(result.filesScanned).toBeGreaterThan(10);
    if (!result.ok) {
      // Fail with readable message
      const sample = result.findings
        .slice(0, 5)
        .map((f) => `${f.file}:${f.line} ${f.id}`)
        .join('\n');
      throw new Error(`Unexpected denylist hits:\n${sample}`);
    }
    expect(result.ok).toBe(true);
  });
});
