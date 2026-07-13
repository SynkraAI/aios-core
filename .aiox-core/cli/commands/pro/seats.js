/**
 * Pro Seats Self-Service CLI (EPIC-PRO-17 / STORY-PRO-17.5)
 *
 *   aiox pro seats list [--email E] [--token T]
 *   aiox pro seats release <activationId> [--email E] [--token T]
 *
 * @module cli/commands/pro/seats
 */

'use strict';

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');

const PRO_PACKAGE = '@aiox-squads/pro';

function resolveLicensePath() {
  const relativePath = path.resolve(__dirname, '..', '..', '..', '..', 'pro', 'license');
  if (fs.existsSync(relativePath)) {
    return relativePath;
  }

  try {
    const proPkg = require.resolve(`${PRO_PACKAGE}/package.json`);
    const npmPath = path.join(path.dirname(proPkg), 'license');
    if (fs.existsSync(npmPath)) {
      return npmPath;
    }
  } catch {
    // package not installed
  }

  const cwdPath = path.join(process.cwd(), 'node_modules', '@aiox-squads', 'pro', 'license');
  if (fs.existsSync(cwdPath)) {
    return cwdPath;
  }

  return relativePath;
}

const licensePath = resolveLicensePath();

function loadModules() {
  try {
    const { licenseApi } = require(path.join(licensePath, 'license-api'));
    const { generateMachineId } = require(path.join(licensePath, 'machine-id'));
    const { AuthError } = require(path.join(licensePath, 'errors'));
    return { licenseApi, generateMachineId, AuthError };
  } catch (error) {
    console.error('AIOX Pro license module not available.');
    console.error('Install AIOX Pro: aiox pro setup');
    console.error(error.message);
    process.exit(1);
  }
}

async function resolveAccessToken(options, licenseApi) {
  if (options.token) {
    return options.token;
  }

  const email = options.email || process.env.AIOX_PRO_EMAIL;
  const password = options.password || process.env.AIOX_PRO_PASSWORD;

  if (!email || !password) {
    console.error('Authentication required.');
    console.error('Use --email with AIOX_PRO_PASSWORD, --token, or AIOX_PRO_EMAIL/AIOX_PRO_PASSWORD.');
    process.exit(1);
    return null;
  }

  try {
    const login = await licenseApi.login(email, password);
    return login.sessionToken;
  } catch (error) {
    console.error(`Login failed: ${error.message}`);
    process.exit(1);
    return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString();
}

async function listSeatsAction(options) {
  const { licenseApi, generateMachineId } = loadModules();
  const accessToken = await resolveAccessToken(options, licenseApi);
  if (!accessToken) return;

  let machineId;
  try {
    machineId = generateMachineId();
  } catch (error) {
    console.error(`\nFailed to identify this machine: ${error.message}`);
    process.exit(1);
    return;
  }

  try {
    const result = await licenseApi.listSeats(accessToken, machineId);

    console.log('\nAIOX Pro — Seats\n');
    console.log(`  Used:      ${result.summary.used}/${result.summary.max}`);
    console.log(`  Available: ${result.summary.available}`);
    console.log('');

    if (!result.seats || result.seats.length === 0) {
      console.log('  No active seats.');
      console.log('');
      return;
    }

    for (const seat of result.seats) {
      const current = seat.isCurrentMachine ? ' (this machine)' : '';
      console.log(`  • ${seat.machineIdMasked}${current}`);
      console.log(`    ID:        ${seat.id}`);
      if (seat.machineName) {
        console.log(`    Name:      ${seat.machineName}`);
      }
      if (seat.aiosVersion) {
        console.log(`    Version:   ${seat.aiosVersion}`);
      }
      console.log(`    Activated: ${formatDate(seat.activatedAt)}`);
      console.log(`    Validated: ${formatDate(seat.lastValidatedAt)}`);
      console.log('');
    }
  } catch (error) {
    console.error(`\nFailed to list seats: ${error.message}`);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
    return;
  }
}

async function releaseSeatAction(activationId, options) {
  const { licenseApi, generateMachineId } = loadModules();

  if (!activationId) {
    console.error('Usage: aiox pro seats release <activationId>');
    process.exit(1);
    return;
  }

  const accessToken = await resolveAccessToken(options, licenseApi);
  if (!accessToken) return;

  let machineId;
  try {
    machineId = generateMachineId();
  } catch (error) {
    console.error(`\nFailed to identify this machine: ${error.message}`);
    process.exit(1);
    return;
  }

  try {
    const result = await licenseApi.releaseSeat(accessToken, activationId, machineId);

    console.log('\nSeat released successfully.\n');
    console.log(`  Released:  ${result.releasedActivationId || activationId}`);
    console.log(`  Available: ${result.summary.available}/${result.summary.max}`);
    console.log('');
  } catch (error) {
    console.error(`\nFailed to release seat: ${error.message}`);
    if (error.code) {
      console.error(`Error code: ${error.code}`);
    }
    process.exit(1);
    return;
  }
}

function createSeatsCommand() {
  const seatsCmd = new Command('seats').description('List and release Pro seats (self-service)');

  const authOptions = (cmd) => {
    cmd
      .option('--email <email>', 'Account email')
      .option('--token <token>', 'Supabase access token');
    return cmd;
  };

  authOptions(seatsCmd.command('list').description('List active seats'))
    .action(listSeatsAction);

  authOptions(
    seatsCmd
      .command('release')
      .description('Release a remote seat by activation id')
      .argument('<activationId>', 'Seat activation UUID'),
  ).action(releaseSeatAction);

  return seatsCmd;
}

module.exports = {
  createSeatsCommand,
};
