import { plainToInstance } from 'class-transformer';
import { IsString, IsArray, IsNotEmpty, MinLength } from 'class-validator';
import { CamundaWorkflowOptions } from '../interfaces/camunda-options.interface';

/**
 * Workflow deployment configuration for forFeature()
 */
export class CamundaWorkflowOptionsDTO {
  /**
   * Unique workflow name to identify this workflow and link workers to it
   */
  @IsString({ message: 'workflowName must be a string' })
  @IsNotEmpty({ message: 'workflowName is required' })
  @MinLength(1, { message: 'workflowName cannot be empty' })
  workflowName: string;

  /**
   * Path to the BPMN file to deploy
   */
  @IsString({ message: 'bpmn must be a string' })
  @IsNotEmpty({ message: 'bpmn file path is required' })
  @MinLength(1, { message: 'bpmn file path cannot be empty' })
  bpmn: string;

  /**
   * Array of form file paths to deploy (can be empty array for no forms)
   */
  @IsArray({ message: 'forms must be an array' })
  @IsString({ each: true, message: 'Each form path must be a string' })
  forms: string[];

  static fromCamundaWorkflowOptions(
    options: CamundaWorkflowOptions,
  ): CamundaWorkflowOptionsDTO {
    return plainToInstance(CamundaWorkflowOptionsDTO, options);
  }
}
