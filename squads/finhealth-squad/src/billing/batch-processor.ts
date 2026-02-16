/**
 * Batch Processor
 * FinHealth Squad — Phase 12 (M3)
 *
 * Orchestrates parallel generation and signing of TISS batches.
 * Uses Promise.allSettled for concurrent processing (no Redis/BullMQ).
 */

import { logger } from '../logger';
import { XmlSigner } from '../crypto/xml-signer';
import type { CertificateInfo } from '../crypto/types';
import type { MedicalAccount, Procedure, HealthInsurer } from '../database/supabase-client';
import type { TissBatch, BatchConfig, BatchGenerateResult } from './types';
import { DEFAULT_BATCH_CONFIG } from './types';
import {
  groupAccountsByBatch,
  createBatchFromGroup,
} from './tiss-batch-generator';

export interface BatchProcessorDeps {
  /** Fetch validated accounts for an org, optionally filtered */
  fetchAccounts: (
    organizationId: string,
    filters?: { healthInsurerId?: string; competencia?: string },
  ) => Promise<MedicalAccount[]>;
  /** Fetch procedures for given account IDs */
  fetchProcedures: (accountIds: string[]) => Promise<Map<string, Procedure[]>>;
  /** Fetch health insurer info */
  fetchInsurer: (insurerId: string) => Promise<HealthInsurer | null>;
}

export class BatchProcessor {
  private config: BatchConfig;
  private deps: BatchProcessorDeps;
  private signer: XmlSigner;

  constructor(deps: BatchProcessorDeps, config?: Partial<BatchConfig>) {
    this.config = { ...DEFAULT_BATCH_CONFIG, ...config };
    this.deps = deps;
    this.signer = new XmlSigner();
  }

  /**
   * Generate batches from validated accounts.
   * Groups by (operadora, competencia), generates XML in parallel.
   */
  async generateBatches(
    organizationId: string,
    filters?: { healthInsurerId?: string; competencia?: string },
  ): Promise<BatchGenerateResult> {
    const errors: string[] = [];
    const batches: TissBatch[] = [];

    // 1. Fetch accounts
    const accounts = await this.deps.fetchAccounts(organizationId, filters);

    if (accounts.length === 0) {
      return { success: true, batches: [], totalGuides: 0, totalAmount: 0, errors: [] };
    }

    // 2. Fetch procedures for all accounts
    const accountIds = accounts.map((a) => a.id);
    const procedures = await this.deps.fetchProcedures(accountIds);

    // 3. Group by (insurer, competencia)
    const groups = groupAccountsByBatch(accounts, procedures);

    logger.info('[BatchProcessor] Processing batches', {
      totalAccounts: accounts.length,
      groupCount: groups.size,
      concurrency: this.config.concurrency,
    });

    // 4. Process groups in parallel (bounded concurrency)
    const groupEntries = Array.from(groups.entries());
    const chunks = this.chunk(groupEntries, this.config.concurrency);

    for (const chunk of chunks) {
      const promises = chunk.map(async ([_key, group]) => {
        // Enforce max guides per batch — split if needed
        const accountChunks = this.chunk(group.accounts, this.config.maxGuidesPerBatch);

        for (const accountChunk of accountChunks) {
          const chunkProcs = new Map<string, Procedure[]>();
          for (const acc of accountChunk) {
            const procs = group.procedures.get(acc.id);
            if (procs) chunkProcs.set(acc.id, procs);
          }

          // Fetch insurer info
          const insurer = await this.deps.fetchInsurer(group.key.healthInsurerId);
          if (!insurer) {
            errors.push(`Health insurer not found: ${group.key.healthInsurerId}`);
            return;
          }

          const batch = createBatchFromGroup(
            group.key,
            accountChunk,
            chunkProcs,
            { name: insurer.name, ansCode: insurer.ans_code },
            organizationId,
          );

          batches.push(batch);
        }
      });

      const results = await Promise.allSettled(promises);

      for (const result of results) {
        if (result.status === 'rejected') {
          const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
          errors.push(`Batch generation failed: ${msg}`);
          logger.error('[BatchProcessor] Batch generation error', { error: msg });
        }
      }
    }

    const totalGuides = batches.reduce((sum, b) => sum + b.guideCount, 0);
    const totalAmount = batches.reduce((sum, b) => sum + b.totalAmount, 0);

    logger.info('[BatchProcessor] Generation complete', {
      batchCount: batches.length,
      totalGuides,
      totalAmount,
      errors: errors.length,
    });

    return {
      success: errors.length === 0,
      batches,
      totalGuides,
      totalAmount,
      errors,
    };
  }

  /**
   * Sign a batch XML using the organization's certificate.
   */
  signBatch(
    batch: TissBatch,
    privateKeyPem: string,
    certificatePem: string,
    certificateInfo: CertificateInfo,
  ): TissBatch {
    if (!batch.xml) {
      return { ...batch, status: 'failed', error: 'No XML to sign' };
    }

    try {
      const result = this.signer.sign(batch.xml, privateKeyPem, certificatePem, certificateInfo);

      logger.info('[BatchProcessor] Batch signed', {
        batchId: batch.id,
        insurer: batch.healthInsurerName,
      });

      return {
        ...batch,
        signedXml: result.signedXml,
        status: 'signed',
        processedAt: new Date(),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('[BatchProcessor] Signing failed', { batchId: batch.id, error: msg });
      return { ...batch, status: 'failed', error: `Signing failed: ${msg}` };
    }
  }

  /**
   * Sign multiple batches in parallel.
   */
  async signBatches(
    batches: TissBatch[],
    privateKeyPem: string,
    certificatePem: string,
    certificateInfo: CertificateInfo,
  ): Promise<TissBatch[]> {
    const chunks = this.chunk(batches, this.config.concurrency);
    const results: TissBatch[] = [];

    for (const chunk of chunks) {
      const promises = chunk.map((batch) =>
        Promise.resolve(this.signBatch(batch, privateKeyPem, certificatePem, certificateInfo)),
      );

      const settled = await Promise.allSettled(promises);

      for (const result of settled) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          const msg = result.reason instanceof Error ? result.reason.message : String(result.reason);
          logger.error('[BatchProcessor] Batch sign error', { error: msg });
        }
      }
    }

    return results;
  }

  /**
   * Split an array into chunks of given size.
   */
  private chunk<T>(items: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
      chunks.push(items.slice(i, i + size));
    }
    return chunks;
  }
}
