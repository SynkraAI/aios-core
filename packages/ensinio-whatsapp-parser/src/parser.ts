/**
 * WhatsApp Chat Export Parser
 * Extracts contacts, messages, and metadata from WhatsApp export files
 */

import { createReadStream } from 'fs';
import { extname, parse as parsePath } from 'path';
import { Extract } from 'unzipper';
import {
  Contact,
  DateRange,
  Message,
  ParsedExport,
  ParsingError,
  WhatsAppFormat,
} from './types';

// Regex patterns for detecting and parsing messages
const ANDROID_BR_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s+-\s+(.+?):\s+(.*)$/;
const IOS_BR_PATTERN = /^\[(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\]\s+(.+?):\s+(.*)$/;

// System message filters
const SYSTEM_MESSAGE_FILTERS = [
  /mensagens e chamadas são protegidas/i,
  /criou o grupo/i,
  /adicionou/i,
  /saiu/i,
  /removeu/i,
  /mudou o ícone/i,
  /mudou a descrição/i,
  /mudou o assunto/i,
  /apagou esta mensagem/i,
  /<mídia oculta>/i,
];

// Title prefixes that should be separated from names
const TITLE_PREFIXES = ['dr', 'dra', 'prof', 'profa', 'sr', 'sra', 'mrs', 'mr', 'ms', 'eng'];

/**
 * Detects WhatsApp chat format (Android BR or iOS BR)
 * @param content - First 500 chars of the chat file
 * @returns Detected format
 */
function detectFormat(content: string): WhatsAppFormat {
  if (ANDROID_BR_PATTERN.test(content)) {
    return 'android_br';
  }
  if (IOS_BR_PATTERN.test(content)) {
    return 'ios_br';
  }
  return 'unknown';
}

/**
 * Checks if a message is a system message (should be filtered)
 * @param content - Message content
 * @returns True if message is a system message
 */
function isSystemMessage(content: string): boolean {
  return SYSTEM_MESSAGE_FILTERS.some(filter => filter.test(content));
}

/**
 * Extracts intelligent name from raw WhatsApp name
 * Handles titles (Dr, Prof, Sr, etc.) and capitalizes properly
 * @param rawName - Raw name from WhatsApp
 * @returns Cleaned and properly formatted name
 */
function extractIntelligentName(rawName: string): string {
  // Remove leading/trailing whitespace
  let name = rawName.trim();

  if (!name) {
    return 'Unknown';
  }

  // Split by spaces
  const parts = name.split(/\s+/);
  if (parts.length === 0) {
    return 'Unknown';
  }

  // Check if first part is a title
  const firstPartLower = parts[0].toLowerCase();
  let titleIndex = -1;

  for (let i = 0; i < TITLE_PREFIXES.length; i++) {
    if (firstPartLower.startsWith(TITLE_PREFIXES[i])) {
      titleIndex = i;
      break;
    }
  }

  // Reconstruct name properly
  const processedParts: string[] = [];

  // Add title with capital letter if found
  if (titleIndex !== -1) {
    const title = parts[0];
    processedParts.push(title.charAt(0).toUpperCase() + title.slice(1).toLowerCase());

    // Add remaining name parts, capitalize first letter of each
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      processedParts.push(part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
    }
  } else {
    // No title, just capitalize each word
    for (const part of parts) {
      processedParts.push(part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());
    }
  }

  return processedParts.join(' ');
}

/**
 * Parses a single line of WhatsApp chat based on detected format
 * @param line - Single line from chat file
 * @param format - Detected WhatsApp format
 * @returns Parsed message object or null if not a valid message
 */
interface RawMessage {
  timestamp: string;
  name: string;
  content: string;
}

function parseLine(line: string, format: WhatsAppFormat): RawMessage | null {
  if (format === 'android_br') {
    const match = line.match(ANDROID_BR_PATTERN);
    if (!match) {
      return null;
    }

    const [, day, month, year, hour, minute, name, content] = match;
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      0
    );

    return {
      timestamp: date.toISOString(),
      name: extractIntelligentName(name),
      content: content.trim(),
    };
  }

  if (format === 'ios_br') {
    const match = line.match(IOS_BR_PATTERN);
    if (!match) {
      return null;
    }

    const [, day, month, year, hour, minute, second, name, content] = match;
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      parseInt(hour, 10),
      parseInt(minute, 10),
      parseInt(second, 10)
    );

    return {
      timestamp: date.toISOString(),
      name: extractIntelligentName(name),
      content: content.trim(),
    };
  }

  return null;
}

/**
 * Parses all lines from chat content
 * Handles multi-line messages by concatenating continuation lines
 * @param content - Full chat file content
 * @param format - Detected format
 * @returns Array of parsed messages with contact names
 */
function parseAllMessages(
  content: string,
  format: WhatsAppFormat
): Array<RawMessage & { isSystem: boolean }> {
  const lines = content.split('\n');
  const messages: Array<RawMessage & { isSystem: boolean }> = [];
  let currentMessage: (RawMessage & { isSystem: boolean }) | null = null;

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const parsed = parseLine(line, format);

    if (parsed) {
      // Valid message start
      const isSystem = isSystemMessage(parsed.content);
      currentMessage = { ...parsed, isSystem };
      messages.push(currentMessage);
    } else if (currentMessage && line.trim()) {
      // Continuation line (part of multi-line message)
      currentMessage.content += '\n' + line;
    }
  }

  return messages;
}

/**
 * Groups messages by contact and creates Contact objects
 * @param messages - Array of parsed messages
 * @returns Array of Contact objects
 */
function groupByContact(messages: Array<RawMessage & { isSystem: boolean }>): Contact[] {
  const contactMap = new Map<string, {
    name: string;
    messages: Message[];
    messageCount: number;
    firstDate: Date;
    lastDate: Date;
  }>();

  for (const msg of messages) {
    // Skip system messages
    if (msg.isSystem) {
      continue;
    }

    if (!contactMap.has(msg.name)) {
      const date = new Date(msg.timestamp);
      contactMap.set(msg.name, {
        name: msg.name,
        messages: [],
        messageCount: 0,
        firstDate: date,
        lastDate: date,
      });
    }

    const contact = contactMap.get(msg.name);
    if (!contact) {
      continue;
    }

    contact.messages.push({
      timestamp: msg.timestamp,
      content: msg.content,
    });
    contact.messageCount += 1;

    const date = new Date(msg.timestamp);
    if (date < contact.firstDate) {
      contact.firstDate = date;
    }
    if (date > contact.lastDate) {
      contact.lastDate = date;
    }
  }

  // Convert map to Contact array and sort by message count
  const contacts: Contact[] = Array.from(contactMap.values())
    .map(c => ({
      name: c.name,
      phone: '', // Phone will be filled by phone-normalizer later
      message_count: c.messageCount,
      first_message_date: c.firstDate.toISOString().split('T')[0],
      last_message_date: c.lastDate.toISOString().split('T')[0],
      messages: c.messages,
    }))
    .sort((a, b) => b.message_count - a.message_count);

  return contacts;
}

/**
 * Extracts date range from messages
 * @param messages - All parsed messages
 * @returns DateRange object with start and end dates
 */
function extractDateRange(messages: Array<RawMessage & { isSystem: boolean }>): DateRange {
  if (messages.length === 0) {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    return { start: dateStr, end: dateStr };
  }

  const dates = messages.map(m => new Date(m.timestamp));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

  return {
    start: minDate.toISOString().split('T')[0],
    end: maxDate.toISOString().split('T')[0],
  };
}

/**
 * Extracts group name from parsed content
 * Uses first system message mentioning group creation or chat filename
 * @param content - Chat file content
 * @param zipPath - Original ZIP path (for fallback)
 * @returns Group name string
 */
function extractGroupName(content: string, zipPath: string): string {
  // Try to extract from system messages
  const groupCreateMatch = content.match(/(.+?)\s+criou o grupo/i);
  if (groupCreateMatch) {
    return groupCreateMatch[1].trim();
  }

  // Fallback: use filename
  const filename = parsePath(zipPath).name;
  return filename || 'WhatsApp Chat Export';
}

/**
 * Parses a WhatsApp chat export ZIP file
 * @param zipPath - Path to the ZIP file containing _chat.txt
 * @returns Parsed export with contacts and messages
 * @throws ParsingError if ZIP is invalid or format not recognized
 */
export async function parseWhatsAppExport(zipPath: string): Promise<ParsedExport> {
  try {
    // Validate ZIP path
    if (!zipPath) {
      throw new ParsingError('ZIP path is required', 'missing_zip_path');
    }

    if (extname(zipPath).toLowerCase() !== '.zip') {
      throw new ParsingError(
        `Expected .zip file, got ${extname(zipPath)}`,
        'invalid_file_extension'
      );
    }

    let chatContent = '';
    const stream = createReadStream(zipPath);

    // Extract _chat.txt from ZIP
    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(Extract({ path: '/tmp' }))
        .on('entry', (entry: unknown) => {
          const typedEntry = entry as { path: string; autodrain: () => void; on: (event: string, cb: (chunk?: unknown) => void) => void };
          if (typedEntry.path === '_chat.txt') {
            typedEntry.on('data', (chunk: unknown) => {
              const buffer = chunk as Buffer;
              chatContent += buffer.toString('utf-8');
            });
            typedEntry.on('end', () => {
              // Continue processing
            });
          } else {
            typedEntry.autodrain();
          }
        })
        .on('close', () => {
          resolve();
        })
        .on('error', reject);
    });

    // Validate extracted content
    if (!chatContent || chatContent.trim().length === 0) {
      throw new ParsingError(
        'No _chat.txt file found in ZIP or file is empty',
        'empty_chat_file',
        'BLOCKING'
      );
    }

    // Detect format
    const format = detectFormat(chatContent);
    if (format === 'unknown') {
      throw new ParsingError(
        'Could not detect WhatsApp chat format (expected Android BR or iOS BR)',
        'unknown_format',
        'BLOCKING'
      );
    }

    // Parse all messages
    const allMessages = parseAllMessages(chatContent, format);

    if (allMessages.length === 0) {
      throw new ParsingError(
        'No valid messages found in chat file',
        'no_valid_messages',
        'BLOCKING'
      );
    }

    // Extract contacts
    const contacts = groupByContact(allMessages);

    if (contacts.length === 0) {
      throw new ParsingError(
        'No valid contacts extracted from messages',
        'no_valid_contacts',
        'BLOCKING'
      );
    }

    // Extract metadata
    const dateRange = extractDateRange(allMessages);
    const groupName = extractGroupName(chatContent, zipPath);

    return {
      group_name: groupName,
      date_range: dateRange,
      total_messages: allMessages.length,
      total_contacts: contacts.length,
      contacts,
    };
  } catch (error) {
    if (error instanceof ParsingError) {
      throw error;
    }

    // Wrap unexpected errors
    const message = error instanceof Error ? error.message : String(error);
    throw new ParsingError(
      `Unexpected error during parsing: ${message}`,
      'parse_error',
      'BLOCKING'
    );
  }
}

/**
 * Detects and returns the format of a WhatsApp chat (for testing/validation)
 * @param content - Chat file content sample
 * @returns Detected format
 */
export function detectChatFormat(content: string): WhatsAppFormat {
  return detectFormat(content);
}

/**
 * Extracts intelligent names from raw WhatsApp names (for testing/external use)
 * @param rawName - Raw name to process
 * @returns Cleaned and formatted name
 */
export function extractName(rawName: string): string {
  return extractIntelligentName(rawName);
}
