import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { Camunda8WorkerJobMetadata } from '../interfaces/camunda-worker-job-metadata.interface';
import { plainToInstance } from 'class-transformer';

/**
 * Metadata for a worker job
 */
export class Camunda8WorkerJobMetadataDTO {
  /**
   * The type of the job
   */
  @IsString({ message: 'jobType must be a string' })
  @IsNotEmpty({ message: 'jobType is required' })
  @MinLength(1, { message: 'jobType cannot be empty' })
  jobType: string;

  /**
   * The workflow name this job belongs to
   */
  @IsString({ message: 'workflowName must be a string' })
  @IsNotEmpty({ message: 'workflowName is required' })
  @MinLength(1, { message: 'workflowName cannot be empty' })
  workflowName: string;

  static fromCamunda8WorkerJobMetadata(
    metadata: Camunda8WorkerJobMetadata,
  ): Camunda8WorkerJobMetadataDTO {
    return plainToInstance(Camunda8WorkerJobMetadataDTO, metadata);
  }
}
