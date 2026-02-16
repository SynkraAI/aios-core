/**
 * Batch Processing Types
 * FinHealth Squad — Phase 12 (M3)
 */

export type BatchStatus = 'pending' | 'processing' | 'signed' | 'sent' | 'accepted' | 'rejected' | 'failed';

export interface TissBatch {
  id: string;
  organizationId: string;
  healthInsurerId: string;
  healthInsurerName: string;
  healthInsurerAnsCode: string;
  competencia: string; // YYYY-MM
  guideCount: number;
  totalAmount: number;
  status: BatchStatus;
  xml?: string;
  signedXml?: string;
  error?: string;
  createdAt: Date;
  processedAt?: Date;
  sentAt?: Date;
}

export interface BatchConfig {
  /** Maximum guides per batch (ANS limit) */
  maxGuidesPerBatch: number;
  /** Whether to auto-sign batches with org certificate */
  autoSign: boolean;
  /** Parallelism: max concurrent batch generations */
  concurrency: number;
}

export const DEFAULT_BATCH_CONFIG: BatchConfig = {
  maxGuidesPerBatch: 100,
  autoSign: true,
  concurrency: 5,
};

export interface BatchGroupKey {
  healthInsurerId: string;
  competencia: string;
}

export interface BatchGenerateInput {
  organizationId: string;
  /** Filter by specific insurer (optional — all if omitted) */
  healthInsurerId?: string;
  /** Filter by competencia YYYY-MM (optional — auto-detect if omitted) */
  competencia?: string;
  /** Override default config */
  config?: Partial<BatchConfig>;
}

export interface BatchGenerateResult {
  success: boolean;
  batches: TissBatch[];
  totalGuides: number;
  totalAmount: number;
  errors: string[];
}

export interface BatchSignInput {
  batchId: string;
  privateKeyPem: string;
  certificatePem: string;
  certificateInfo: import('../crypto/types').CertificateInfo;
}
