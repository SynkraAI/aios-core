#!/usr/bin/env node
/**
 * AIOS-Core Installation Diagnostic Tool
 *
 * Run this script to diagnose installation issues:
 *   node diagnose-installation.js
 *
 * Or directly from URL:
 *   npx https://raw.githubusercontent.com/SynkraAI/aios-core/main/tools/diagnose-installation.js
 */

const { execSync, spawnSync: _spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const REQUIRED_NODE = '18.0.0';
const REQUIRED_NPM = '9.0.0';

console.log('');
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║          AIOS-Core Installation Diagnostic Tool                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// Helper functions
function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (_e) {
    return null;
  }
}

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
    if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
  }
  return 0;
}

function checkMark(ok) {
  return ok ? '✓' : '✗';
}

let hasErrors = false;
let hasWarnings = false;

// 1. System Information
console.log('── System Information ──────────────────────────────────────────────');
console.log(`  Platform:     ${os.platform()} (${os.arch()})`);
console.log(`  OS:           ${os.type()} ${os.release()}`);
console.log(`  Hostname:     ${os.hostname()}`);
console.log(`  Home:         ${os.homedir()}`);
console.log(`  User:         ${os.userInfo().username}`);
console.log('');

// 2. Node.js Check
console.log('── Node.js ─────────────────────────────────────────────────────────');
const nodeVersion = exec('node --version');
if (nodeVersion) {
  const nodeVer = nodeVersion.replace('v', '');
  const nodeOk = compareVersions(nodeVer, REQUIRED_NODE) >= 0;
  console.log(
    `  ${checkMark(nodeOk)} Version:     ${nodeVersion} (required: >= v${REQUIRED_NODE})`,
  );
  if (!nodeOk) {
    console.log(
      `    ⚠️  ERROR: Node.js version too old! Please upgrade to v${REQUIRED_NODE} or higher.`,
    );
    console.log('    📥 Download: https://nodejs.org/');
    hasErrors = true;
  }
  const nodePath = exec('where node') || exec('which node');
  console.log(`  Path:         ${nodePath ? nodePath.split('\n')[0] : 'NOT FOUND'}`);
} else {
  console.log('  ✗ Node.js:    NOT INSTALLED');
  console.log('    ⚠️  ERROR: Node.js is required!');
  console.log('    📥 Download: https://nodejs.org/');
  hasErrors = true;
}
console.log('');

// 3. npm Check
console.log('── npm ─────────────────────────────────────────────────────────────');
const npmVersion = exec('npm --version');
if (npmVersion) {
  const npmOk = compareVersions(npmVersion, REQUIRED_NPM) >= 0;
  console.log(`  ${checkMark(npmOk)} Version:     v${npmVersion} (required: >= v${REQUIRED_NPM})`);
  if (!npmOk) {
    console.log('    ⚠️  ERROR: npm version too old! Please upgrade.');
    console.log('    📥 Run: npm install -g npm@latest');
    hasErrors = true;
  }
  const npmPath = exec('where npm') || exec('which npm');
  console.log(`  Path:         ${npmPath ? npmPath.split('\n')[0] : 'NOT FOUND'}`);
} else {
  console.log('  ✗ npm:        NOT INSTALLED');
  console.log('    ⚠️  ERROR: npm is required!');
  hasErrors = true;
}
console.log('');

// 4. npx Check
console.log('── npx ─────────────────────────────────────────────────────────────');
const npxVersion = exec('npx --version');
if (npxVersion) {
  console.log(`  ✓ Version:     v${npxVersion}`);
  const npxPath = exec('where npx') || exec('which npx');
  console.log(`  Path:         ${npxPath ? npxPath.split('\n')[0] : 'NOT FOUND'}`);
} else {
  console.log('  ✗ npx:        NOT FOUND');
  console.log('    ⚠️  ERROR: npx is required! Usually comes with npm.');
  hasErrors = true;
}
console.log('');

// 5. Git Check
console.log('── Git ─────────────────────────────────────────────────────────────');
const gitVersion = exec('git --version');
if (gitVersion) {
  console.log(`  ✓ Version:     ${gitVersion.replace('git version ', 'v')}`);
} else {
  console.log('  ✗ Git:        NOT INSTALLED');
  console.log('    ⚠️  WARNING: Git is recommended for full functionality.');
  console.log('    📥 Download: https://git-scm.com/');
  hasWarnings = true;
}
console.log('');

// 6. npm Configuration
console.log('── npm Configuration ───────────────────────────────────────────────');
const npmPrefix = exec('npm config get prefix');
const npmCache = exec('npm config get cache');
const npmRegistry = exec('npm config get registry');
console.log(`  Prefix:       ${npmPrefix || 'NOT SET'}`);
console.log(`  Cache:        ${npmCache || 'NOT SET'}`);
console.log(`  Registry:     ${npmRegistry || 'NOT SET'}`);

// Check if prefix is in PATH
if (npmPrefix) {
  const pathEnv = process.env.PATH || process.env.Path || '';
  const inPath = pathEnv.toLowerCase().includes(npmPrefix.toLowerCase());
  console.log(
    `  ${checkMark(inPath)} In PATH:     ${inPath ? 'Yes' : 'NO - This may cause issues!'}`,
  );
  if (!inPath) {
    console.log('    ⚠️  WARNING: npm prefix is not in PATH!');
    console.log(`    📝 Add this to your PATH: ${npmPrefix}`);
    hasWarnings = true;
  }
}
console.log('');

// 7. Network Check
console.log('── Network Access ──────────────────────────────────────────────────');
const registryCheck = exec('npm ping 2>&1');
if (registryCheck && registryCheck.includes('PONG')) {
  console.log('  ✓ npm registry is accessible');
} else {
  // Try curl/wget
  const curlCheck = exec('curl -s -o /dev/null -w "%{http_code}" https://registry.npmjs.org/ 2>&1');
  if (curlCheck === '200') {
    console.log('  ✓ npm registry is accessible (via curl)');
  } else {
    console.log('  ⚠️  Cannot verify npm registry access');
    console.log(`    Registry check result: ${registryCheck || 'no response'}`);
    hasWarnings = true;
  }
}
console.log('');

// 8. Package Availability Check
console.log('── Package Availability ────────────────────────────────────────────');
const pkgInfo = exec('npm view aios-core version 2>&1');
if (pkgInfo && !pkgInfo.includes('E404') && !pkgInfo.includes('error')) {
  console.log(`  ✓ aios-core v${pkgInfo} is available on npm`);
} else {
  console.log('  ⚠️  Cannot verify aios-core package availability');
  console.log(`    Result: ${pkgInfo || 'no response'}`);
  hasWarnings = true;
}
console.log('');

// 9. Permission Check (Windows/Unix)
console.log('── Permissions ─────────────────────────────────────────────────────');
if (os.platform() === 'win32') {
  // Check PowerShell execution policy
  const psPolicy = exec('powershell -Command "Get-ExecutionPolicy"');
  if (psPolicy) {
    const policyOk = ['Unrestricted', 'RemoteSigned', 'Bypass'].includes(psPolicy);
    console.log(`  ${checkMark(policyOk)} PowerShell Execution Policy: ${psPolicy}`);
    if (!policyOk) {
      console.log('    ⚠️  WARNING: Restricted policy may block scripts.');
      console.log(
        '    📝 Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser',
      );
      hasWarnings = true;
    }
  }
} else {
  // Check npm global folder permissions
  if (npmPrefix && fs.existsSync(npmPrefix)) {
    try {
      fs.accessSync(npmPrefix, fs.constants.W_OK);
      console.log('  ✓ npm prefix is writable');
    } catch {
      console.log('  ✗ npm prefix is NOT writable');
      console.log('    ⚠️  WARNING: May need sudo or fix permissions');
      hasWarnings = true;
    }
  }
}
console.log('');

// 10. Test npx execution
console.log('── npx Test ────────────────────────────────────────────────────────');
console.log('  Testing: npx aios-core@latest --version');
const npxTest = exec('npx aios-core@latest --version 2>&1');
if (npxTest && npxTest.match(/\d+\.\d+\.\d+/)) {
  console.log(`  ✓ SUCCESS: ${npxTest}`);
} else {
  console.log(`  ✗ FAILED: ${npxTest || 'no output'}`);
  hasErrors = true;
}
console.log('');

// Summary
console.log('══════════════════════════════════════════════════════════════════');
if (hasErrors) {
  console.log('❌ RESULT: Installation requirements NOT met');
  console.log('');
  console.log('COMMON FIXES:');
  console.log('  1. Update Node.js: https://nodejs.org/ (download LTS version)');
  console.log('  2. Update npm: npm install -g npm@latest');
  console.log('  3. Clear npm cache: npm cache clean --force');
  console.log('  4. Check firewall/proxy settings');
  console.log('');
} else if (hasWarnings) {
  console.log('⚠️  RESULT: May work but some issues detected');
  console.log('   Review warnings above for optimal setup.');
  console.log('');
} else {
  console.log('✅ RESULT: All requirements met!');
  console.log('');
  console.log('You can install AIOS-Core with:');
  console.log('  npx aios-core@latest');
  console.log('');
}

// Output machine-readable summary
const summary = {
  timestamp: new Date().toISOString(),
  platform: os.platform(),
  arch: os.arch(),
  node: nodeVersion,
  npm: npmVersion,
  npx: npxVersion,
  git: gitVersion,
  npmPrefix,
  npmCache,
  npmRegistry,
  hasErrors,
  hasWarnings,
  npxTestResult: npxTest,
};

const summaryFile = path.join(os.tmpdir(), 'aios-diagnostic-result.json');
fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
console.log(`📋 Full diagnostic saved to: ${summaryFile}`);
console.log('');
