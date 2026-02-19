/**
 * Format Duration Utility
 *
 * Converts milliseconds to human-readable duration strings.
 *
 * @module utils/format-duration
 */

'use strict';

const MAX_DAYS = 999;

/**
 * Format milliseconds to human-readable duration (e.g., "1h 2m 3s")
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration
 */
function formatDuration(ms) {
  if (ms == null || typeof ms !== 'number' || isNaN(ms)) {
    return '0s';
  }

  const isNegative = ms < 0;
  const absMs = Math.abs(ms);

  const totalSeconds = Math.floor(absMs / 1000);

  if (totalSeconds === 0) {
    return '0s';
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days >= MAX_DAYS) {
    return `${MAX_DAYS}d+`;
  }

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  const result = parts.join(' ');
  return isNegative ? `-${result}` : result;
}

/**
 * Format milliseconds to short timer format (e.g., "1:02:03" or "1:30")
 * @param {number} ms - Duration in milliseconds
 * @returns {string} Formatted duration in timer format
 */
function formatDurationShort(ms) {
  if (ms == null || typeof ms !== 'number' || isNaN(ms) || ms < 0) {
    return '0:00';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${minutes}:${pad(seconds)}`;
}

module.exports = { formatDuration, formatDurationShort };
