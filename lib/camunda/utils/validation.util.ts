import { validate, ValidationError } from 'class-validator';
import { CamundaConfigurationError } from '../errors/camunda-errors';
import { CamundaClientOptionsDTO } from '../dtos/camunda-client-options.dto';
import { CamundaWorkflowOptionsDTO } from '../dtos/camunda-workflow-options.dto';
import { Camunda8WorkerJobMetadataDTO } from '../dtos/camunda-worker-job-metadata.dto';

/**
 * Validates CamundaClientOptions and throws CamundaConfigurationError if invalid
 * @param options - The options to validate
 * @throws {CamundaConfigurationError} If validation fails
 */
export async function validateClientOptions(
  options: CamundaClientOptionsDTO,
): Promise<void> {
  const errors = await validate(options, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const errorMessages = formatValidationErrors(errors);
    throw new CamundaConfigurationError(
      `Invalid Camunda client configuration: ${errorMessages.join(', ')}`,
      options,
      errorMessages,
    );
  }
}

/**
 * Validates CamundaWorkflowOptions and throws CamundaConfigurationError if invalid
 * @param options - The options to validate
 * @throws {CamundaConfigurationError} If validation fails
 */
export async function validateWorkflowOptions(
  options: CamundaWorkflowOptionsDTO,
): Promise<void> {
  const errors = await validate(options, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const errorMessages = formatValidationErrors(errors);
    throw new CamundaConfigurationError(
      `Invalid Camunda workflow configuration: ${errorMessages.join(', ')}`,
      options,
      errorMessages,
    );
  }
}

export async function validateWorkerJobMetadata(
  metadata: Camunda8WorkerJobMetadataDTO,
): Promise<void> {
  const errors = await validate(metadata, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const errorMessages = formatValidationErrors(errors);
    throw new CamundaConfigurationError(
      `Invalid Camunda worker job metadata: ${errorMessages.join(', ')}`,
      metadata,
      errorMessages,
    );
  }
}

/**
 * Formats validation errors into readable messages
 */
function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      for (const constraint of Object.values(error.constraints)) {
        messages.push(`${error.property}: ${constraint}`);
      }
    }
    if (error.children && error.children.length > 0) {
      const childMessages = formatValidationErrors(error.children);
      messages.push(...childMessages.map((msg) => `${error.property}.${msg}`));
    }
  }

  return messages;
}
