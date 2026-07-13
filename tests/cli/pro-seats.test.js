'use strict';

const { createSeatsCommand } = require('../../.aiox-core/cli/commands/pro/seats');

describe('aiox pro seats CLI', () => {
  it('does not expose plaintext password flags', () => {
    const command = createSeatsCommand();
    const help = command.helpInformation();
    const list = command.commands.find((subcommand) => subcommand.name() === 'list');
    const release = command.commands.find((subcommand) => subcommand.name() === 'release');

    expect(help).toContain('List and release Pro seats');
    expect(list.helpInformation()).not.toContain('--password');
    expect(release.helpInformation()).not.toContain('--password');
  });
});
