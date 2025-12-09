import type {
  IInputVariables,
  ICustomHeaders,
  IOutputVariables,
  ZeebeJob,
  JOB_ACTION_ACKNOWLEDGEMENT,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

/**
 * Base class that all Camunda8 worker handlers must extend.
 * Ensures handlers properly return job.complete() or job.fail() results.
 *
 * @example
 * ```typescript
 * @WorkerJob('payment-processing')
 * @Injectable()
 * export class PaymentHandler extends Camunda8WorkerHandler<PaymentInput, PaymentOutput> {
 *   async handle(job: Readonly<ZeebeJob<PaymentInput, {}, PaymentOutput>>) {
 *     return await job.complete({ result: 'success' });
 *   }
 * }
 * ```
 */
export abstract class Camunda8WorkerHandler<
  TInputVariables extends IInputVariables = IInputVariables,
  TOutputVariables extends IOutputVariables = IOutputVariables,
  TCustomHeaders extends ICustomHeaders = ICustomHeaders,
> {
  /**
   * Handle a Camunda8 job.
   * Must return the result of job.complete() or job.fail().
   *
   * @param job The Zeebe job to process
   * @returns Promise resolving to JOB_ACTION_ACKNOWLEDGEMENT
   */
  abstract handle(
    job: Readonly<ZeebeJob<TInputVariables, TCustomHeaders, TOutputVariables>>,
  ): Promise<typeof JOB_ACTION_ACKNOWLEDGEMENT>;
}
