// Define custom types for your application

// IPC Message Types
export interface IPCMessage {
    type: string;
    payload: any;
  }
  
  // Configuration Types
  export interface AppConfig {
    environment: "development" | "production" | "test";
    logLevel: "info" | "warn" | "error" | "debug";
    // Add other configuration properties
  }
  
  // Window Management Types
  export interface WindowOptions {
    width: number;
    height: number;
    title: string;
    resizable: boolean;
    // Add other window options
  }
  
  // Deployment specific types
  export type Environment = "dev" | "qa" | "stg" | "prod";
  
  // Flow types
  export type Flow = "portal" | "widget";
  
  export interface DeploymentConfig {
    rootDirectory: string;
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
  
  // Flow configuration
  export interface FlowConfig {
    name: string;
    path: string;
    command: string;
  }
  
  export const FLOWS: Record<Flow, FlowConfig> = {
    portal: {
      name: "Frontend/Portal",
      path: "Frontend/Portal",
      command: "yarn deploy"
    },
    widget: {
      name: "Frontend/Widget",
      path: "Frontend/Widget",
      command: "npm run deploy"
    }
  };