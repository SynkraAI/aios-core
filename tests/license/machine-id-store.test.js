'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
  readPersistedMachineId,
  writePersistedMachineId,
  isValidMachineId,
  _resetMachineIdStoreForTests,
  _PATHS,
} = require('../../pro/license/machine-id-store');
const {
  generateMachineId,
  _resetMachineIdCacheForTests,
} = require('../../pro/license/license-crypto');

const VALID_ID = 'a'.repeat(64);

describe('machine-id-store', () => {
  beforeEach(() => {
    _resetMachineIdStoreForTests();
    _resetMachineIdCacheForTests();
  });

  afterEach(() => {
    _resetMachineIdStoreForTests();
    _resetMachineIdCacheForTests();
  });

  it('validates sha256 hex machine ids', () => {
    expect(isValidMachineId(VALID_ID)).toBe(true);
    expect(isValidMachineId('not-a-hash')).toBe(false);
    expect(isValidMachineId('a'.repeat(63))).toBe(false);
  });

  it('writes and reads persisted machine id with restricted permissions', () => {
    writePersistedMachineId(VALID_ID);

    expect(readPersistedMachineId()).toBe(VALID_ID);

    const stat = fs.statSync(_PATHS.MACHINE_ID_FILE);
    expect(stat.mode & 0o777).toBe(0o600);
  });

  it('ignores corrupted persisted files', () => {
    fs.mkdirSync(_PATHS.MACHINE_ID_DIR, { recursive: true });
    fs.writeFileSync(_PATHS.MACHINE_ID_FILE, 'corrupt-value\n', 'utf8');

    expect(readPersistedMachineId()).toBeNull();
  });

  it('generateMachineId prefers persisted value over recomputation', () => {
    writePersistedMachineId(VALID_ID);

    const id = generateMachineId();
    expect(id).toBe(VALID_ID);
  });
});