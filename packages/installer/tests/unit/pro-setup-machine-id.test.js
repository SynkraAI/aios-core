const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');

const { _testing } = require('../../src/wizard/pro-setup');

describe('pro setup machine id', () => {
  test('uses the same native machine id fingerprint as the Pro runtime', () => {
    const nativeMachineId = machineIdSync(true);
    const expected = crypto
      .createHash('sha256')
      .update(`aiox-pro-native-machine-id:v1:${nativeMachineId}`)
      .digest('hex');

    expect(_testing.generateMachineId()).toBe(expected);
  });
});
