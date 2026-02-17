// File: common/utils/status-mapper.js

/**
 * Status Mapper - Bidirectional status mapping between AIOS and ClickUp
 *
 * This module provides utilities for:
 * - Mapping AIOS story statuses to ClickUp custom field values
 * - Mapping ClickUp story-status values back to AIOS statuses
 * - Handling ClickUp-specific statuses (e.g., "Ready for Dev")
 *
 * CRITICAL: Stories use ClickUp custom field "story-status", NOT native status.
 * Epics use the native ClickUp status field (Planning, In Progress, Done).
 */

const STATUS_MAPPING = {
  AIOS_TO_CLICKUP: {
    'Draft': 'Draft',
    'Ready for Review': 'Ready for Review',
    'Review': 'Review',
    'In Progress': 'In Progress',
    'Done': 'Done',
    'Blocked': 'Blocked',
  },
  CLICKUP_TO_AIOS: {
    'Draft': 'Draft',
    'Ready for Dev': 'Ready for Review',  // ClickUp-specific status
    'Ready for Review': 'Ready for Review',
    'Review': 'Review',
    'In Progress': 'In Progress',
    'Done': 'Done',
    'Blocked': 'Blocked',
  },
};

/**
 * Maps an AIOS story status to ClickUp story-status custom field value
 *
 * @param {string} aiosStatus - Local .md file status
 * @returns {string} ClickUp story-status value
 */
function mapStatusToClickUp(aiosStatus) {
  const mapped = STATUS_MAPPING.AIOS_TO_CLICKUP[aiosStatus];

  if (!mapped) {
    console.warn(`Unknown AIOS status: ${aiosStatus}, using as-is`);
    return aiosStatus;
  }

  return mapped;
}

/**
 * Maps a ClickUp story-status custom field value to AIOS story status
 *
 * @param {string} clickupStatus - ClickUp story-status value
 * @returns {string} Local .md file status
 */
function mapStatusFromClickUp(clickupStatus) {
  const mapped = STATUS_MAPPING.CLICKUP_TO_AIOS[clickupStatus];

  if (!mapped) {
    console.warn(`Unknown ClickUp status: ${clickupStatus}, using as-is`);
    return clickupStatus;
  }

  return mapped;
}

/**
 * Validates if a status is a valid AIOS story status
 *
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
function isValidAIOSStatus(status) {
  return Object.keys(STATUS_MAPPING.AIOS_TO_CLICKUP).includes(status);
}

/**
 * Validates if a status is a valid ClickUp story-status value
 *
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
function isValidClickUpStatus(status) {
  return Object.keys(STATUS_MAPPING.CLICKUP_TO_AIOS).includes(status);
}

/**
 * Gets all valid AIOS story statuses
 *
 * @returns {string[]} Array of valid statuses
 */
function getValidAIOSStatuses() {
  return Object.keys(STATUS_MAPPING.AIOS_TO_CLICKUP);
}

/**
 * Gets all valid ClickUp story-status values
 *
 * @returns {string[]} Array of valid statuses
 */
function getValidClickUpStatuses() {
  return Object.keys(STATUS_MAPPING.CLICKUP_TO_AIOS);
}

module.exports = {
  mapStatusToClickUp,
  mapStatusFromClickUp,
  isValidAIOSStatus,
  isValidClickUpStatus,
  getValidAIOSStatuses,
  getValidClickUpStatuses,
  STATUS_MAPPING, // Export for testing
};
