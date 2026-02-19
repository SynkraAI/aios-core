// Shared configuration constants for the Zap platform
// App-specific configs live in apps/api/src/lib/config.ts

export const ZAP_DEFAULTS = {
  groupCapacity: 1024,
  humanizedDelayMinMs: 2000,
  humanizedDelayMaxMs: 8000,
  maxBroadcastMessages: 10,
  maxDailyMessages: 3000,
  hourlyMessageCap: 500,
} as const
