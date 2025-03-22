// src/types.ts
export interface IPCMessage {
  type: string;
  payload: any;
}

export interface AppConfig {
  environment: "development" | "production" | "test";
  logLevel: "info" | "warn" | "error" | "debug";
}

export interface WindowOptions {
  width: number;
  height: number;
  title: string;
  resizable: boolean;
}

// Customizable Environment type (string instead of fixed union)
export type Environment = string;

// Flow type remains a string but will be dynamic
export type Flow = string;

// Command step type
export interface CommandSteps {
  [step: string]: string; // e.g., "1": "cd path", "2": "npm run command"
}

// Updated FlowConfig with command steps
export interface FlowConfig {
  name: string;
  commands: Record<Environment, CommandSteps>; // Commands as steps per environment
}

export interface Project {
  name: string;
  path: string; // Base path for the project
  environments: Environment[]; // Custom environments for this project
  flows: Record<Flow, FlowConfig>; // Dynamic flows
}

export interface DeploymentConfig {
  projects: Project[];
  selectedProject: string | null; // Name of the selected project
  selectedEnvironments: Environment[];
  selectedFlows: Flow[];
}

export interface CommandResult {
  id: string;
  flow: Flow;
  environment: Environment;
  directory: string;
  status: "running" | "success" | "error" | "stopped";
  logs: string;
  startTime: number;
  endTime?: number;
}

// Error type definitions
export enum ErrorCode {
  CONFIG_LOAD_ERROR = "CONFIG_LOAD_ERROR",
  CONFIG_SAVE_ERROR = "CONFIG_SAVE_ERROR",
  DIRECTORY_ACCESS_ERROR = "DIRECTORY_ACCESS_ERROR",
  COMMAND_EXECUTION_ERROR = "COMMAND_EXECUTION_ERROR",
  PROCESS_SPAWN_ERROR = "PROCESS_SPAWN_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface DeploymentError extends Error {
  code: ErrorCode;
  details?: any;
  retry?: boolean; // Whether the operation can be retried
}

export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  factor: number; // Backoff factor
}
