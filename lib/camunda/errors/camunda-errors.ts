/**
 * Base error class for Camunda-related errors
 */
export class CamundaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CamundaError';
    Object.setPrototypeOf(this, CamundaError.prototype);
  }
}

/**
 * Error thrown when Camunda configuration is invalid
 */
export class CamundaConfigurationError extends CamundaError {
  constructor(
    message: string,
    public readonly options?: any,
    public readonly validationErrors?: string[],
  ) {
    super(message);
    this.name = 'CamundaConfigurationError';
    Object.setPrototypeOf(this, CamundaConfigurationError.prototype);
  }
}

/**
 * Error thrown when workflow deployment fails
 */
export class CamundaDeploymentError extends CamundaError {
  constructor(
    message: string,
    public readonly workflowName: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'CamundaDeploymentError';
    Object.setPrototypeOf(this, CamundaDeploymentError.prototype);
  }
}

/**
 * Error thrown when worker registration fails
 */
export class CamundaWorkerError extends CamundaError {
  constructor(
    message: string,
    public readonly workflowName?: string,
    public readonly jobType?: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'CamundaWorkerError';
    Object.setPrototypeOf(this, CamundaWorkerError.prototype);
  }
}
