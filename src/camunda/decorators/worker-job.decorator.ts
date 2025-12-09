import 'reflect-metadata';
import { WORKER_JOB_METADATA_KEY } from '../camunda.constants';
import { Camunda8WorkerJobMetadata } from '../interfaces/camunda-worker-job-metadata.interface';

/**
 * Class decorator to mark a class as a Camunda8 worker handler.
 * The class must extend Camunda8WorkerHandler base class.
 *
 * @param jobType The job type this handler processes
 * @param workflowName The workflow name this job belongs to (must match forFeature workflowName)
 * @example
 * ```typescript
 * @WorkerJob('payment-processing', 'order-workflow')
 * @Injectable()
 * export class PaymentHandler extends Camunda8WorkerHandler<PaymentInput, PaymentOutput> {
 *   async handle(job: Readonly<ZeebeJob<PaymentInput, {}, PaymentOutput>>) {
 *     // Process job and return output variables or throw an error
 *     return { result: 'success' };
 *   }
 * }
 * ```
 */
export function WorkerJob(jobType: string, workflowName: string) {
  return function <T extends { new (...args: any[]): object }>(target: T) {
    const metadata: Camunda8WorkerJobMetadata = {
      jobType,
      workflowName,
    };
    Reflect.defineMetadata(WORKER_JOB_METADATA_KEY, metadata, target);
    return target;
  };
}
