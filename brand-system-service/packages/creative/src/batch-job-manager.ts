/**
 * BatchJobManager — In-memory async job status tracking for batch generation (BSS-4.6).
 *
 * MVP implementation using a module-level Map. Resets on server restart.
 * Phase 2 will migrate to a persistent queue (Redis/BullMQ).
 */

import type { BatchBrief, BatchResult } from './types';
import type { BatchPipeline } from './batch-pipeline';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface JobState {
  status: JobStatus;
  progress: number;
  result?: BatchResult;
  error?: string;
}

// ---------------------------------------------------------------------------
// Module-level storage (MVP — in-memory)
// ---------------------------------------------------------------------------

const jobStore = new Map<string, JobState>();

let jobSequence = 0;

function generateJobId(): string {
  jobSequence++;
  return `job-${Date.now()}-${String(jobSequence).padStart(3, '0')}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Submit a batch job for async execution.
 * Returns the jobId immediately; execution runs in background.
 *
 * @param brief - Batch generation brief
 * @param pipeline - BatchPipeline instance to execute
 * @returns jobId for status polling
 */
export function submitJob(brief: BatchBrief, pipeline: BatchPipeline): string {
  const jobId = generateJobId();

  jobStore.set(jobId, {
    status: 'queued',
    progress: 0,
  });

  // Fire-and-forget async execution
  void (async () => {
    jobStore.set(jobId, { status: 'running', progress: 0 });

    try {
      const result = await pipeline.run(brief);
      jobStore.set(jobId, {
        status: 'done',
        progress: 100,
        result,
      });
    } catch (error) {
      jobStore.set(jobId, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })();

  return jobId;
}

/**
 * Get current status of a batch job.
 *
 * @param jobId - Job identifier returned from submitJob
 * @returns Current job state or undefined if not found
 */
export function getJobStatus(jobId: string): JobState | undefined {
  return jobStore.get(jobId);
}

/**
 * Reset the job store (for testing).
 */
export function resetJobStore(): void {
  jobStore.clear();
  jobSequence = 0;
}
