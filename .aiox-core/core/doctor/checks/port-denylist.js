/**
 * Doctor Check: OSS port denylist hygiene
 *
 * FAIL if core/package/script sources contain hub/enterprise/product tokens
 * that must not ship in open-source aiox-core (workspace product, sinkra_*, etc.).
 *
 * @module aiox-core/doctor/checks/port-denylist
 * @story CORE-SU.A4
 */

'use strict';

const { scanProject } = require('../../security/port-denylist');

const name = 'port-denylist';

/**
 * @param {{ projectRoot: string }} context
 */
async function run(context) {
  const projectRoot = context.projectRoot || process.cwd();
  let result;
  try {
    result = scanProject({ projectRoot });
  } catch (error) {
    return {
      check: name,
      status: 'FAIL',
      message: `port-denylist scan errored: ${error.message}. Run: npm run validate:port-denylist`,
      fixCommand: 'npm run validate:port-denylist',
    };
  }

  if (result.ok) {
    return {
      check: name,
      status: 'PASS',
      message: `OSS port denylist clean (${result.filesScanned} files scanned)`,
      fixCommand: null,
    };
  }

  const sample = result.findings
    .slice(0, 3)
    .map((f) => `${f.file}:${f.line} [${f.id}]`)
    .join('; ');

  return {
    check: name,
    status: 'FAIL',
    message: `${result.findings.length} denylist hit(s). e.g. ${sample}. Run: npm run validate:port-denylist`,
    fixCommand: 'npm run validate:port-denylist',
  };
}

module.exports = { name, run };
