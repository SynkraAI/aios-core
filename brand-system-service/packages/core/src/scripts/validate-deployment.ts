/**
 * Post-deployment validation script.
 *
 * Usage:
 *   ts-node validate-deployment.ts --url=https://brand.acme.com
 *
 * Checks:
 *   1. Site responds with HTTP 200
 *   2. Security headers present (X-Content-Type-Options, X-Frame-Options,
 *      X-XSS-Protection, Referrer-Policy)
 *   3. Asset path serves with correct Cache-Control header
 *
 * Exit codes:
 *   0 = all checks pass
 *   1 = one or more checks failed
 *
 * Requires Node.js 18+ (native fetch).
 *
 * @module scripts/validate-deployment
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

const REQUIRED_SECURITY_HEADERS = [
  'x-content-type-options',
  'x-frame-options',
  'x-xss-protection',
  'referrer-policy',
] as const;

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function getUrl(argv: string[]): string {
  for (const arg of argv) {
    const match = arg.match(/^--url=(.+)$/);
    if (match) {
      return match[1];
    }
  }
  throw new Error('Missing required argument: --url={deployedSiteUrl}');
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

async function checkSiteResponds(url: string): Promise<CheckResult> {
  const name = 'Site responds with 200';
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    if (!response.ok) {
      return { name, passed: false, detail: `HTTP ${response.status} ${response.statusText}` };
    }
    return { name, passed: true, detail: `HTTP ${response.status}` };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { name, passed: false, detail: `Network error: ${message}` };
  }
}

async function checkSecurityHeaders(url: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    for (const header of REQUIRED_SECURITY_HEADERS) {
      const value = response.headers.get(header);
      if (value) {
        results.push({
          name: `Security header: ${header}`,
          passed: true,
          detail: value,
        });
      } else {
        results.push({
          name: `Security header: ${header}`,
          passed: false,
          detail: 'Missing',
        });
      }
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    for (const header of REQUIRED_SECURITY_HEADERS) {
      results.push({
        name: `Security header: ${header}`,
        passed: false,
        detail: `Request failed: ${message}`,
      });
    }
  }
  return results;
}

async function checkAssetCaching(baseUrl: string): Promise<CheckResult> {
  const name = 'Asset Cache-Control header';
  const assetUrl = new URL('/assets/test.css', baseUrl).href;
  try {
    const response = await fetch(assetUrl, { method: 'HEAD', redirect: 'follow' });
    const cacheControl = response.headers.get('cache-control');
    if (!cacheControl) {
      return { name, passed: false, detail: `No Cache-Control header on ${assetUrl}` };
    }
    // Verify immutable or long max-age is present
    const hasImmutable = cacheControl.includes('immutable');
    const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
    const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
    const hasLongCache = maxAge >= 31536000; // 1 year

    if (hasImmutable || hasLongCache) {
      return { name, passed: true, detail: cacheControl };
    }
    return {
      name,
      passed: false,
      detail: `Cache-Control too short: "${cacheControl}" (expected immutable or max-age>=31536000)`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { name, passed: false, detail: `Request to ${assetUrl} failed: ${message}` };
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

function printResults(results: CheckResult[]): boolean {
  let allPassed = true;

  console.log('\n=== Deployment Validation Results ===\n');

  for (const result of results) {
    const icon = result.passed ? 'PASS' : 'FAIL';
    console.log(`  [${icon}] ${result.name}`);
    console.log(`         ${result.detail}`);
    if (!result.passed) {
      allPassed = false;
    }
  }

  const passCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`\n  Result: ${passCount}/${totalCount} checks passed\n`);

  return allPassed;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  try {
    const url = getUrl(process.argv.slice(2));
    console.log(`Validating deployment: ${url}`);

    const results: CheckResult[] = [];

    // 1. Site responds
    results.push(await checkSiteResponds(url));

    // 2. Security headers
    const headerResults = await checkSecurityHeaders(url);
    results.push(...headerResults);

    // 3. Asset caching
    results.push(await checkAssetCaching(url));

    const allPassed = printResults(results);

    if (!allPassed) {
      process.exit(1);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exit(1);
  }
}

main();
