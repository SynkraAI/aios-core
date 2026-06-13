const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');

function readPackageJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

describe('runtime dependency manifests', () => {
  const inquirerRuntimeManifests = [
    'package.json',
    '.aiox-core/package.json',
    'packages/installer/package.json',
  ];

  test.each(inquirerRuntimeManifests)('%s declares onetime with inquirer', (manifestPath) => {
    const pkg = readPackageJson(manifestPath);

    expect(pkg.dependencies).toHaveProperty('inquirer');
    expect(pkg.dependencies).toHaveProperty('onetime');
  });
});
