/**
 * @ensinio/whatsapp-parser
 * Standalone WhatsApp chat export parser
 */

export {
  // Types
  Message,
  Contact,
  DateRange,
  ParsedExport,
  ValidationCheck,
  ValidationMetrics,
  ValidationReport,
  ParsingError,
  PhoneNormalizationError,
  PhoneNormalizationOptions,
  WhatsAppFormat,
} from './types';

export { parseWhatsAppExport, detectChatFormat, extractName } from './parser';

// Export functions (to be implemented)
// export { normalizePhoneNumber, validatePhoneFormat } from './phone-normalizer';
// export { validateParsedData } from './validator';
