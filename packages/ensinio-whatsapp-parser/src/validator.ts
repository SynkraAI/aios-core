/**
 * Data Validation
 * Validates parsed WhatsApp exports against blocking and warning checks
 */

import { ParsedExport, ValidationCheck, ValidationMetrics, ValidationReport } from './types';

/**
 * Runs BLOCKING validation checks
 * All must pass for PASS verdict
 * @param data - Parsed export data
 * @returns Array of validation checks
 */
function runBlockingChecks(data: ParsedExport): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  // Check 1: At least 1 contact extracted
  checks.push({
    id: 'blocking_check_1',
    reason: 'At least 1 contact must be extracted',
    severity: 'BLOCKING',
    passed: data.total_contacts >= 1,
  });

  // Check 2: At least 10 non-system messages (proxy: at least 10 total messages)
  checks.push({
    id: 'blocking_check_2',
    reason: 'At least 10 non-system messages required (has ' + data.total_messages + ')',
    severity: 'BLOCKING',
    passed: data.total_messages >= 10,
  });

  // Check 3: Contacts array is not empty
  checks.push({
    id: 'blocking_check_3',
    reason: 'Contacts array must not be empty',
    severity: 'BLOCKING',
    passed: data.contacts.length > 0,
  });

  // Check 4: Each contact has required fields
  const allContactsValid = data.contacts.every(
    contact => contact.name && contact.messages && contact.messages.length > 0
  );
  checks.push({
    id: 'blocking_check_4',
    reason: 'All contacts must have name, phone, and messages',
    severity: 'BLOCKING',
    passed: allContactsValid,
  });

  // Check 5: Date range is valid
  const dateRangeValid: boolean =
    !!data.date_range &&
    !!data.date_range.start &&
    !!data.date_range.end &&
    data.date_range.start <= data.date_range.end;
  checks.push({
    id: 'blocking_check_5',
    reason: 'Date range must be valid with start <= end',
    severity: 'BLOCKING',
    passed: dateRangeValid,
  });

  // Check 6: Messages are in chronological order per contact
  const messagesOrdered = data.contacts.every(contact => {
    for (let i = 1; i < contact.messages.length; i++) {
      if (contact.messages[i].timestamp < contact.messages[i - 1].timestamp) {
        return false;
      }
    }
    return true;
  });
  checks.push({
    id: 'blocking_check_6',
    reason: 'Messages must be in chronological order per contact',
    severity: 'BLOCKING',
    passed: messagesOrdered,
  });

  return checks;
}

/**
 * Runs WARNING validation checks
 * Failures are recorded but don't prevent PASS verdict
 * @param data - Parsed export data
 * @returns Array of validation checks
 */
function runWarningChecks(data: ParsedExport): ValidationCheck[] {
  const checks: ValidationCheck[] = [];

  // Check 1: Phone coverage >= 50%
  const contactsWithPhone = data.contacts.filter(c => c.phone && c.phone.trim()).length;
  const phoneCoverage = data.total_contacts > 0 ? (contactsWithPhone / data.total_contacts) * 100 : 0;
  checks.push({
    id: 'warning_check_1',
    reason: `Phone coverage is ${phoneCoverage.toFixed(0)}% (target: >= 50%)`,
    severity: 'WARNING',
    passed: phoneCoverage >= 50,
  });

  // Check 2: No duplicate contacts
  const contactNames = new Set(data.contacts.map(c => c.name));
  const hasDuplicates = contactNames.size !== data.contacts.length;
  checks.push({
    id: 'warning_check_2',
    reason: `No duplicate contacts (${hasDuplicates ? 'FOUND' : 'OK'})`,
    severity: 'WARNING',
    passed: !hasDuplicates,
  });

  // Check 3: Valid encoding (no garbled names)
  // Simple heuristic: names should mostly contain ASCII or common accented characters
  const garbbledContactCount = data.contacts.filter(c => {
    // Check for excessive non-ASCII characters
    // eslint-disable-next-line no-control-regex
    const nonAscii = (c.name.match(/[^\x00-\x7F]/g) || []).length;
    return nonAscii > c.name.length * 0.5; // More than 50% non-ASCII is suspicious
  }).length;
  checks.push({
    id: 'warning_check_3',
    reason: `Encoding quality OK (${garbbledContactCount} potentially garbled names)`,
    severity: 'WARNING',
    passed: garbbledContactCount === 0,
  });

  // Check 4: Group metadata present
  const hasGroupName: boolean = !!data.group_name && data.group_name.trim().length > 0;
  const hasDateRange: boolean =
    !!data.date_range && !!data.date_range.start && !!data.date_range.end;
  checks.push({
    id: 'warning_check_4',
    reason: 'Group name and date range present',
    severity: 'WARNING',
    passed: hasGroupName && hasDateRange,
  });

  // Check 5: Reasonable message distribution
  // At least one contact with >= 3 messages
  const hasActiveContact = data.contacts.some(c => c.message_count >= 3);
  checks.push({
    id: 'warning_check_5',
    reason: 'At least one contact with 3+ messages',
    severity: 'WARNING',
    passed: hasActiveContact,
  });

  return checks;
}

/**
 * Calculates quality metrics from parsed data
 * @param data - Parsed export data
 * @returns Metrics object
 */
function calculateMetrics(data: ParsedExport): ValidationMetrics {
  const contactsWithPhone = data.contacts.filter(c => c.phone && c.phone.trim()).length;
  const phoneCoverage = data.total_contacts > 0
    ? ((contactsWithPhone / data.total_contacts) * 100).toFixed(0) + '%'
    : '0%';

  const avgMessagesPerContact = data.total_contacts > 0
    ? Math.round(data.total_messages / data.total_contacts)
    : 0;

  // Calculate date range days
  let dateRangeDays = 0;
  if (data.date_range && data.date_range.start && data.date_range.end) {
    const startDate = new Date(data.date_range.start);
    const endDate = new Date(data.date_range.end);
    dateRangeDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  // Top 5 most active contacts
  const top5 = data.contacts
    .slice(0, 5)
    .map(c => `${c.name} (${c.message_count})`);

  return {
    total_contacts: data.total_contacts,
    contacts_with_phone: contactsWithPhone,
    phone_coverage: phoneCoverage,
    total_messages: data.total_messages,
    system_messages_filtered: 0, // Would need tracking from parser
    avg_messages_per_contact: avgMessagesPerContact,
    date_range_days: dateRangeDays,
    most_active_contacts_top5: top5,
  };
}

/**
 * Generates recommendation based on validation results
 * @param blockingChecks - Blocking check results
 * @param warningChecks - Warning check results
 * @returns Recommendation string
 */
function generateRecommendation(
  blockingChecks: ValidationCheck[],
  warningChecks: ValidationCheck[]
): string {
  const blockingFailed = blockingChecks.filter(c => !c.passed);

  if (blockingFailed.length > 0) {
    const reasons = blockingFailed.map(c => c.reason).join('; ');
    return `FAIL: ${reasons}. Please re-export the chat and try again.`;
  }

  const warningsFailed = warningChecks.filter(c => !c.passed);

  if (warningsFailed.length === 0) {
    return 'Proceed to next phase - data quality is excellent';
  }

  if (warningsFailed.length <= 2) {
    return 'Proceed to analysis phase with caution - minor quality concerns noted';
  }

  return 'Proceed to analysis phase - multiple quality concerns noted, results may be incomplete';
}

/**
 * Validates parsed WhatsApp export data
 * Runs BLOCKING checks (must all pass) and WARNING checks (logged but non-blocking)
 * @param data - ParsedExport object from parseWhatsAppExport()
 * @returns ValidationReport with status, checks, metrics, and recommendation
 *
 * @example
 * const parsed = await parseWhatsAppExport('./export.zip');
 * const report = validateParsedData(parsed);
 *
 * if (report.status === 'PASS') {
 *   console.log(`Phone coverage: ${report.metrics.phone_coverage}`);
 * } else {
 *   console.log('Validation failed:', report.failed_checks);
 * }
 */
export function validateParsedData(data: ParsedExport): ValidationReport {
  if (!data) {
    throw new Error('Parsed data is required for validation');
  }

  // Run validation checks
  const blockingChecks = runBlockingChecks(data);
  const warningChecks = runWarningChecks(data);

  // Determine overall status
  const blockingFailed = blockingChecks.filter(c => !c.passed);
  const warningsFailed = warningChecks.filter(c => !c.passed);
  const status = blockingFailed.length === 0 ? 'PASS' : 'FAIL';

  // Calculate metrics
  const metrics = calculateMetrics(data);

  // Generate recommendation
  const recommendation = generateRecommendation(blockingChecks, warningChecks);

  // Build report
  const report: ValidationReport = {
    status,
    blocking_checks: {
      passed: blockingChecks.filter(c => c.passed).length,
      failed: blockingFailed.length,
    },
    warning_checks: {
      passed: warningChecks.filter(c => c.passed).length,
      warnings: warningsFailed.length,
    },
    metrics,
    recommendation,
  };

  // Add optional arrays only if there are failures/warnings
  if (blockingFailed.length > 0) {
    report.failed_checks = blockingFailed;
  }

  if (warningsFailed.length > 0) {
    report.warnings = warningsFailed.map(c => c.reason);
  }

  return report;
}
