#!/usr/bin/env node
/**
 * Version Lockstep Sync
 *
 * The publish safety gate (bin/utils/validate-publish.js → Check 5 /
 * scripts/validate-aiox-core-namespace.js) requires `.aiox-core/package.json`
 * to match the root package.json version. semantic-release only bumps the
 * root manifest (in the release working tree), so every release was blocked
 * at prepublishOnly with version drift. This script is the missing `prepare`
 * step: it syncs the internal manifest AND the legacy compat wrapper
 * (`compat/aiox-core/`) — version + its `@aiox-squads/core` dependency pin —
 * to the target version.
 *
 * Wired into .releaserc.json via @semantic-release/exec:
 *   prepareCmd: node scripts/sync-version-lockstep.js ${nextRelease.version}
 *
 * Also usable standalone (release-bump PRs, e.g. chore(release) commits):
 *   node scripts/sync-version-lockstep.js           # target = root version
 *   node scripts/sync-version-lockstep.js 5.3.0     # explicit target
 *
 * Exit codes: 0 = synced (or already in sync), 1 = invalid input / IO error
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SEMVER_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, `${JSON.stringify(obj, null, 2)}\n`);
}

function main() {
  const rootPkg = readJson(path.join(ROOT, 'package.json'));
  const version = process.argv[2] || rootPkg.version;

  if (!SEMVER_RE.test(version)) {
    console.error(`FAIL: invalid semver target "${version}"`);
    process.exit(1);
  }

  // 1. .aiox-core/package.json — version lockstep with root
  //    (validate-aiox-core-namespace.js rule 4: root is SOT)
  const internalPath = path.join(ROOT, '.aiox-core', 'package.json');
  const internal = readJson(internalPath);
  if (internal.version !== version) {
    internal.version = version;
    writeJson(internalPath, internal);
    console.log(`synced: .aiox-core/package.json -> ${version}`);
  } else {
    console.log(`ok: .aiox-core/package.json already ${version}`);
  }

  // 2. compat/aiox-core/package.json — legacy wrapper version + exact
  //    dependency pin on the scoped package (published by npm-publish.yml)
  const compatPath = path.join(ROOT, 'compat', 'aiox-core', 'package.json');
  const compat = readJson(compatPath);
  let compatChanged = false;
  if (compat.version !== version) {
    compat.version = version;
    compatChanged = true;
  }
  if (compat.dependencies && compat.dependencies['@aiox-squads/core'] !== version) {
    compat.dependencies['@aiox-squads/core'] = version;
    compatChanged = true;
  }
  if (compatChanged) {
    writeJson(compatPath, compat);
    console.log(`synced: compat/aiox-core/package.json -> ${version} (version + dependency pin)`);
  } else {
    console.log(`ok: compat/aiox-core/package.json already ${version}`);
  }

  console.log(`PASS: version lockstep at ${version}`);
}

main();
