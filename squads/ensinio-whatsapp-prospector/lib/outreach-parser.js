/**
 * Outreach Markdown Parser
 *
 * Centralized parser for outreach-messages.md format.
 * Supports both v1 (basic) and v2 (extended) formats.
 *
 * Format:
 *   ### N. Name (Score X)
 *   **Phone:** +5511...
 *   **Approach:** client/relationship/mentorship
 *   **Message:**
 *   <message text>
 *   **WhatsApp Link:** `https://...`
 *   ---
 *
 * Usage:
 *   const { parseOutreachMarkdown } = require('./outreach-parser');
 *   const prospects = parseOutreachMarkdown(mdContent);
 *
 * @module outreach-parser
 */

'use strict';

/**
 * Parse outreach markdown content into structured prospect data
 *
 * @param {string} mdContent - Raw markdown content from outreach-messages.md
 * @returns {Array<Object>} Array of prospect objects
 */
function parseOutreachMarkdown(mdContent) {
  if (typeof mdContent !== 'string') {
    throw new Error('Invalid markdown content: expected non-empty string');
  }

  if (!mdContent.trim()) {
    return [];
  }

  const prospects = [];
  const sections = mdContent.split(/^### \d+\./m).slice(1);

  for (const section of sections) {
    const lines = section.trim().split('\n');

    // Extract name and score from header: " Eduardo (Score 10)"
    const headerMatch = lines[0].match(/^\s*(.+?)\s*\(Score\s*(\d+)\)/);
    if (!headerMatch) continue;

    const name = headerMatch[1].trim();
    const score = parseInt(headerMatch[2], 10);

    // Extract approach (optional)
    const approachLine = lines.find(l => l.startsWith('**Approach:**'));
    const approach = approachLine ? approachLine.replace('**Approach:**', '').trim() : '';

    // Extract phone (optional — may be resolved externally from phone-book)
    const phoneLine = lines.find(l => l.startsWith('**Phone:**'));
    const phone = phoneLine ? phoneLine.replace('**Phone:**', '').trim() : '';

    // Extract message (between **Message:** and **WhatsApp Link:** or ---)
    const messageStart = lines.findIndex(l => l.startsWith('**Message:**'));
    if (messageStart === -1) continue;

    let messageEnd = lines.findIndex((l, i) =>
      i > messageStart && (l.startsWith('**WhatsApp Link:**') || l === '---'),
    );
    if (messageEnd === -1) messageEnd = lines.length;

    const message = lines.slice(messageStart + 1, messageEnd)
      .join('\n')
      .trim();

    // Extract WhatsApp link (optional — may be generated externally)
    const linkLine = lines.find(l => l.startsWith('**WhatsApp Link:**'));
    let whatsappLink = '';
    if (linkLine) {
      const linkMatch = linkLine.match(/`(https:\/\/[^`]+)`/);
      whatsappLink = linkMatch ? linkMatch[1] : '';
    }

    prospects.push({
      name,
      score,
      approach,
      phone,
      message,
      whatsappLink,
      rawSection: section.trim(),
    });
  }

  return prospects;
}

/**
 * Parse and return only the first prospect (for testing/single-contact flows)
 *
 * @param {string} mdContent - Raw markdown content
 * @returns {Object|null} First prospect or null if none found
 */
function parseFirstProspect(mdContent) {
  const prospects = parseOutreachMarkdown(mdContent);
  return prospects.length > 0 ? prospects[0] : null;
}

/**
 * Validate parsed prospect data
 *
 * @param {Array<Object>} prospects - Array of prospect objects
 * @returns {Object} Validation result with { isValid, errors }
 */
function validateParsedProspects(prospects) {
  const errors = [];

  if (!Array.isArray(prospects)) {
    return { isValid: false, errors: ['Prospects must be an array'] };
  }

  for (let i = 0; i < prospects.length; i++) {
    const p = prospects[i];
    if (!p.name || typeof p.name !== 'string') {
      errors.push(`Prospect ${i}: missing or invalid name`);
    }
    if (typeof p.score !== 'number' || p.score < 0 || p.score > 10) {
      errors.push(`Prospect ${i}: invalid score (must be 0-10)`);
    }
    if (!p.message || p.message.length < 10) {
      errors.push(`Prospect ${i}: message too short or missing`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  parseOutreachMarkdown,
  parseFirstProspect,
  validateParsedProspects,
};
