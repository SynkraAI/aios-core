const crypto = require('crypto');
const { machineIdSync } = require('node-machine-id');

const { _testing } = require('@aiox-squads/installer/pro-setup');

describe('pro setup machine id', () => {
  afterEach(() => {
    jest.dontMock('node-machine-id');
    jest.dontMock('os');
  });

  test('uses the same native machine id fingerprint as the Pro runtime', () => {
    const nativeMachineId = machineIdSync(true);
    const expected = crypto
      .createHash('sha256')
      .update(`aiox-pro-native-machine-id:v1:${nativeMachineId}`)
      .digest('hex');

    expect(_testing.generateMachineId()).toBe(expected);
  });

  test('falls back to the legacy fingerprint when native machine id is unavailable', () => {
    jest.doMock('node-machine-id', () => ({
      machineIdSync: jest.fn(() => {
        throw new Error('Native machine id unavailable');
      }),
    }));
    jest.doMock('os', () => ({
      hostname: jest.fn(() => 'fallback-host'),
      cpus: jest.fn(() => [{ model: 'fallback-cpu' }]),
      networkInterfaces: jest.fn(() => ({
        en0: [{ internal: false, mac: 'aa:bb:cc:dd:ee:ff' }],
      })),
    }));

    jest.isolateModules(() => {
      const { _testing: isolatedTesting } = require('@aiox-squads/installer/pro-setup');
      const expected = crypto
        .createHash('sha256')
        .update('fallback-host|fallback-cpu|aa:bb:cc:dd:ee:ff')
        .digest('hex');

      expect(isolatedTesting.generateMachineId()).toBe(expected);
    });
  });
});
