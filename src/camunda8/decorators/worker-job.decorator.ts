import 'reflect-metadata';
import { WORKER_JOB_METADATA_KEY } from '../camunda8.constants';
import { Camunda8WorkerJobMetadata } from '../interfaces/camunda8-worker-job-metadata.interface';

export function WorkerJob(jobType: string) {
  return function (
    target: any,
    propertyKey: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _descriptor: PropertyDescriptor,
  ) {
    const metadata: Camunda8WorkerJobMetadata = {
      jobType,
    };
    Reflect.defineMetadata(
      WORKER_JOB_METADATA_KEY,
      metadata,
      target,
      propertyKey,
    );
  };
}
