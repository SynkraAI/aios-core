'use strict';

const path = require('path');

const seatsModule = '@aiox-core/cli/commands/pro/seats';
const licensePath = path.resolve(__dirname, '../../pro/license');

const mockLicenseApi = {
  listSeats: jest.fn(),
  releaseSeat: jest.fn(),
};
const mockGenerateMachineId = jest.fn();
const mockAuthError = class MockAuthError extends Error {};

describe('aiox pro seats CLI', () => {
  let createSeatsCommand;

  beforeEach(() => {
    jest.resetModules();
    mockLicenseApi.listSeats.mockReset();
    mockLicenseApi.releaseSeat.mockReset();
    mockGenerateMachineId.mockReset().mockReturnValue('machine-id-123');
    jest.doMock(path.join(licensePath, 'license-api'), () => ({ licenseApi: mockLicenseApi }), {
      virtual: true,
    });
    jest.doMock(path.join(licensePath, 'machine-id'), () => ({
      generateMachineId: mockGenerateMachineId,
    }), { virtual: true });
    jest.doMock(path.join(licensePath, 'errors'), () => ({ AuthError: mockAuthError }), {
      virtual: true,
    });
    ({ createSeatsCommand } = require(seatsModule));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not expose plaintext password flags', () => {
    const command = createSeatsCommand();
    const help = command.helpInformation();
    const list = command.commands.find((subcommand) => subcommand.name() === 'list');
    const release = command.commands.find((subcommand) => subcommand.name() === 'release');

    expect(help).toContain('List and release Pro seats');
    expect(list.helpInformation()).not.toContain('--password');
    expect(release.helpInformation()).not.toContain('--password');
  });

  it('lists active seats using the authenticated machine identity', async () => {
    mockLicenseApi.listSeats.mockResolvedValue({
      summary: { used: 1, max: 3, available: 2 },
      seats: [{ id: 'activation-1', machineIdMasked: '...abcd', isCurrentMachine: true }],
    });
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const command = createSeatsCommand();
    const list = command.commands.find((subcommand) => subcommand.name() === 'list');
    await list.parseAsync(['--token', 'access-token'], { from: 'user' });

    expect(mockGenerateMachineId).toHaveBeenCalledTimes(1);
    expect(mockLicenseApi.listSeats).toHaveBeenCalledWith('access-token', 'machine-id-123');
  });

  it('releases the requested seat using the authenticated machine identity', async () => {
    mockLicenseApi.releaseSeat.mockResolvedValue({
      releasedActivationId: 'activation-1',
      summary: { available: 3, max: 3 },
    });
    jest.spyOn(console, 'log').mockImplementation(() => {});

    const command = createSeatsCommand();
    const release = command.commands.find((subcommand) => subcommand.name() === 'release');
    await release.parseAsync(['activation-1', '--token', 'access-token'], { from: 'user' });

    expect(mockGenerateMachineId).toHaveBeenCalledTimes(1);
    expect(mockLicenseApi.releaseSeat).toHaveBeenCalledWith(
      'access-token',
      'activation-1',
      'machine-id-123',
    );
  });
});
