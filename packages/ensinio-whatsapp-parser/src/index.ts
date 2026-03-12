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

export { parseWhatsAppExport, detectChatFormat, extractName, isEmojiOnly, resolveNameFromContext } from './parser';
export { normalizePhoneNumber, validatePhoneFormat, normalizePhoneNumbers } from './phone-normalizer';
export { validateParsedData } from './validator';
