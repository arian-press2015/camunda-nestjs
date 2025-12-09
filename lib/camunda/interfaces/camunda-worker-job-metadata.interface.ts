/**
 * Metadata for a worker job
 */
export interface Camunda8WorkerJobMetadata {
  /**
   * The type of the job
   */
  jobType: string;
  /**
   * The workflow name this job belongs to
   */
  workflowName: string;
}
