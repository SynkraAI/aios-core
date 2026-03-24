/**
 * Quality Job Integration — submits quality scoring as a job to JobQueue.
 *
 * Quality scoring runs as a 'text-generation' job type since the
 * meta-evaluation is a text AI call.
 *
 * @see BSS-3.4: Prompt Quality Scoring Pipeline (AC 8)
 */
import type { JobQueue, Job } from '@brand-system/ai-service';
import type { ClientContext } from '@brand-system/prompts';
import type { DeliverableType } from '@brand-system/prompts';
import type { QualityPipelineOptions } from './types';
/** Payload shape for a quality scoring job. */
export interface QualityJobPayload {
    readonly deliverableType: DeliverableType;
    readonly clientContext: ClientContext;
    readonly variant: string;
    readonly options: QualityPipelineOptions;
}
/**
 * Submit a quality scoring pipeline run as a job to the JobQueue.
 *
 * The job is submitted as 'text-generation' type since meta-evaluation
 * uses a text AI call. The actual pipeline execution happens when the
 * job is processed — the consumer must wire up the QualityPipeline
 * as the handler for these quality job payloads.
 *
 * @param queue - The JobQueue instance
 * @param deliverableType - Type of content to generate and score
 * @param clientContext - Client brand context
 * @param variant - A/B variant (default: 'A')
 * @param options - Pipeline options (maxIterations, threshold)
 * @returns The submitted Job
 */
export declare function submitQualityJob(queue: JobQueue, deliverableType: DeliverableType, clientContext: ClientContext, variant?: string, options?: QualityPipelineOptions): Job<QualityJobPayload>;
//# sourceMappingURL=quality-job.d.ts.map