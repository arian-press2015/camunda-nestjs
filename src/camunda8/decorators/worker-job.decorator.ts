import 'reflect-metadata';
import { WORKER_JOB_METADATA_KEY } from '../camunda8.constants';
import { Camunda8WorkerJobMetadata } from '../interfaces/camunda8-worker-job-metadata.interface';

/**
 * Class decorator to mark a class as a Camunda8 worker handler.
 * The class must implement Camunda8WorkerHandler interface.
 *
 * @param jobType The job type this handler processes
 * @example
 * ```typescript
 * @WorkerJob('payment-processing')
 * export class PaymentHandler implements Camunda8WorkerHandler<PaymentInput, PaymentOutput> {
 *   async handle(job: ZeebeJob<PaymentInput, {}, PaymentOutput>) {
 *     // Process job
 *     return await job.complete({ result: 'success' });
 *   }
 * }
 * ```
 */
export function WorkerJob(jobType: string) {
  return function <T extends { new (...args: any[]): object }>(target: T) {
    const metadata: Camunda8WorkerJobMetadata = {
      jobType,
    };
    Reflect.defineMetadata(WORKER_JOB_METADATA_KEY, metadata, target);
    return target;
  };
}
