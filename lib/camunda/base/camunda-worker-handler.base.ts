import type {
  IInputVariables,
  ICustomHeaders,
  IOutputVariables,
  ZeebeJob,
  JOB_ACTION_ACKNOWLEDGEMENT,
} from '@camunda8/sdk/dist/zeebe/lib/interfaces-1.0';

/**
 * Base class that all Camunda8 worker handlers must extend.
 * Provides a structured way to handle jobs and ensures proper completion/failure.
 *
 * @example
 * ```typescript
 * @WorkerJob('payment-processing', 'order-workflow')
 * @Injectable()
 * export class PaymentHandler extends Camunda8WorkerHandler<PaymentInput, PaymentOutput> {
 *   async handle(job: Readonly<ZeebeJob<PaymentInput, {}, PaymentOutput>>) {
 *     // Process job and call job.complete() or job.fail()
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
   * Abstract method to handle a Camunda8 job.
   * Implement this method in your worker classes.
   * You must call job.complete() or job.fail() to acknowledge the job.
   *
   * @param job The Zeebe job to process
   * @returns Promise resolving to JOB_ACTION_ACKNOWLEDGEMENT
   */
  abstract handle(
    job: Readonly<ZeebeJob<TInputVariables, TCustomHeaders, TOutputVariables>>,
  ): Promise<typeof JOB_ACTION_ACKNOWLEDGEMENT>;
}
