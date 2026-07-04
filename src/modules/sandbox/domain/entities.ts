/**
 * Sandbox Module - Domain Entities
 * 
 * Defines the core business entities for the sandbox/workspace system:
 * - SandboxSession: Represents an active execution session
 * - SandboxExecution: Represents a single code execution
 */

export enum RuntimeType {
  PYTHON = 'python',
  NODEJS = 'nodejs',
  BASH = 'bash',
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  TERMINATED = 'terminated',
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
}

/**
 * Represents a single code execution in a sandbox session
 */
export class SandboxExecution {
  constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly code: string,
    public status: ExecutionStatus = ExecutionStatus.PENDING,
    public output: string = '',
    public errorOutput: string = '',
    public exitCode?: number,
    public executionTimeMs?: number,
    public readonly createdAt: Date = new Date(),
    public completedAt?: Date,
  ) {}

  /**
   * Mark execution as running
   */
  markAsRunning(): void {
    this.status = ExecutionStatus.RUNNING;
  }

  /**
   * Mark execution as completed
   */
  markAsCompleted(output: string, exitCode: number, executionTimeMs: number): void {
    this.status = ExecutionStatus.COMPLETED;
    this.output = output;
    this.exitCode = exitCode;
    this.executionTimeMs = executionTimeMs;
    this.completedAt = new Date();
  }

  /**
   * Mark execution as failed
   */
  markAsFailed(errorOutput: string, executionTimeMs: number): void {
    this.status = ExecutionStatus.FAILED;
    this.errorOutput = errorOutput;
    this.exitCode = 1;
    this.executionTimeMs = executionTimeMs;
    this.completedAt = new Date();
  }

  /**
   * Mark execution as timed out
   */
  markAsTimeout(executionTimeMs: number): void {
    this.status = ExecutionStatus.TIMEOUT;
    this.errorOutput = 'Execution timed out';
    this.exitCode = 124;
    this.executionTimeMs = executionTimeMs;
    this.completedAt = new Date();
  }

  /**
   * Check if execution is complete
   */
  isComplete(): boolean {
    return [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED, ExecutionStatus.TIMEOUT].includes(
      this.status
    );
  }

  /**
   * Check if execution was successful
   */
  wasSuccessful(): boolean {
    return this.status === ExecutionStatus.COMPLETED && this.exitCode === 0;
  }

  /**
   * Get combined output (stdout + stderr)
   */
  getCombinedOutput(): string {
    return [this.output, this.errorOutput].filter(Boolean).join('\n');
  }
}

/**
 * Represents a sandbox session (execution environment)
 */
export class SandboxSession {
  private executions: SandboxExecution[] = [];

  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly runtime: RuntimeType,
    public status: SessionStatus = SessionStatus.ACTIVE,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  /**
   * Add an execution to the session
   */
  addExecution(execution: SandboxExecution): void {
    this.executions.push(execution);
    this.updatedAt = new Date();
  }

  /**
   * Get all executions in the session
   */
  getExecutions(): SandboxExecution[] {
    return [...this.executions];
  }

  /**
   * Get the last execution
   */
  getLastExecution(): SandboxExecution | undefined {
    return this.executions[this.executions.length - 1];
  }

  /**
   * Get execution by ID
   */
  getExecutionById(id: string): SandboxExecution | undefined {
    return this.executions.find((exec) => exec.id === id);
  }

  /**
   * Pause the session
   */
  pause(): void {
    this.status = SessionStatus.PAUSED;
    this.updatedAt = new Date();
  }

  /**
   * Resume the session
   */
  resume(): void {
    this.status = SessionStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  /**
   * Terminate the session
   */
  terminate(): void {
    this.status = SessionStatus.TERMINATED;
    this.updatedAt = new Date();
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return this.status === SessionStatus.ACTIVE;
  }

  /**
   * Get session statistics
   */
  getStats(): {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalExecutionTime: number;
  } {
    const completed = this.executions.filter((e) => e.isComplete());
    const successful = completed.filter((e) => e.wasSuccessful());
    const failed = completed.filter((e) => !e.wasSuccessful());
    const totalTime = completed.reduce((sum, e) => sum + (e.executionTimeMs || 0), 0);

    return {
      totalExecutions: this.executions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      totalExecutionTime: totalTime,
    };
  }
}

/**
 * Sandbox execution request
 */
export interface SandboxExecutionRequest {
  code: string;
  timeout?: number; // milliseconds
  env?: Record<string, string>;
}

/**
 * Sandbox execution result
 */
export interface SandboxExecutionResult {
  output: string;
  errorOutput: string;
  exitCode: number;
  executionTimeMs: number;
}
