/**
 * Sandbox Module - Application Service
 * 
 * Implements the business logic for sandbox operations:
 * - Creating sessions
 * - Executing code
 * - Managing execution history
 */

import { SandboxSession, SandboxExecution, RuntimeType, ExecutionStatus } from '../domain/entities';
import { ISandboxSessionRepository, ISandboxExecutionRepository } from '../domain/repositories';
import { ApplicationError } from '@shared/errors';
import { spawn, ChildProcess } from 'child_process';

export interface SandboxServiceOptions {
  sessionRepository: ISandboxSessionRepository;
  executionRepository: ISandboxExecutionRepository;
}

export class SandboxService {
  private sessionRepo: ISandboxSessionRepository;
  private executionRepo: ISandboxExecutionRepository;

  constructor(options: SandboxServiceOptions) {
    this.sessionRepo = options.sessionRepository;
    this.executionRepo = options.executionRepository;
  }

  /**
   * Create a new sandbox session
   */
  async createSession(
    workspaceId: string,
    userId: string,
    runtime: RuntimeType
  ): Promise<SandboxSession> {
    const session = new SandboxSession(
      crypto.randomUUID(),
      workspaceId,
      userId,
      runtime
    );

    return this.sessionRepo.create(session);
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<SandboxSession> {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new ApplicationError('NOT_FOUND', `Session ${sessionId} not found`);
    }
    return session;
  }

  /**
   * Get all sessions for a workspace
   */
  async getSessionsByWorkspace(
    workspaceId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<SandboxSession[]> {
    return this.sessionRepo.findByWorkspaceId(workspaceId, options);
  }

  /**
   * Execute code in a sandbox session
   */
  async executeCode(
    sessionId: string,
    code: string,
    timeout: number = 30000,
    env?: Record<string, string>
  ): Promise<SandboxExecution> {
    const session = await this.getSession(sessionId);

    if (!session.isActive()) {
      throw new ApplicationError('INVALID_STATE', 'Session is not active');
    }

    const execution = new SandboxExecution(
      crypto.randomUUID(),
      sessionId,
      code
    );

    // Save pending execution
    await this.executionRepo.create(execution);
    execution.markAsRunning();

    try {
      const startTime = Date.now();
      const result = await this.executeCodeInternal(code, session.runtime, timeout, env);
      const executionTime = Date.now() - startTime;

      execution.markAsCompleted(result.output, result.exitCode, executionTime);
    } catch (error: any) {
      const executionTime = Date.now() - (Date.now() - 100); // Rough estimate
      if (error.message.includes('timeout')) {
        execution.markAsTimeout(executionTime);
      } else {
        execution.markAsFailed(error.message, executionTime);
      }
    }

    // Update execution with results
    return this.executionRepo.update(execution.id, execution);
  }

  /**
   * Internal code execution logic
   */
  private executeCodeInternal(
    code: string,
    runtime: RuntimeType,
    timeout: number,
    env?: Record<string, string>
  ): Promise<{ output: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      let output = '';
      let errorOutput = '';

      const command = this.getCommand(runtime);
      const childProcess: ChildProcess = spawn(command, ['-c', code], {
        timeout,
        env: { ...process.env, ...env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      childProcess.stdout?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      childProcess.on('close', (exitCode: number | null) => {
        resolve({
          output: output + (errorOutput ? `\nSTDERR:\n${errorOutput}` : ''),
          exitCode: exitCode || 0,
        });
      });

      childProcess.on('error', (error: Error) => {
        reject(error);
      });

      // Handle timeout
      const timeoutHandle = setTimeout(() => {
        childProcess.kill();
        reject(new Error('Code execution timeout'));
      }, timeout);

      // Clear timeout if process completes before timeout
      childProcess.on('close', () => {
        clearTimeout(timeoutHandle);
      });
    });
  }

  /**
   * Get the appropriate command for the runtime
   */
  private getCommand(runtime: RuntimeType): string {
    switch (runtime) {
      case RuntimeType.PYTHON:
        return 'python3';
      case RuntimeType.NODEJS:
        return 'node';
      case RuntimeType.BASH:
        return 'bash';
      default:
        throw new ApplicationError('INVALID_RUNTIME', `Unknown runtime: ${runtime}`);
    }
  }

  /**
   * Get execution history for a session
   */
  async getExecutionHistory(
    sessionId: string,
    limit: number = 50
  ): Promise<SandboxExecution[]> {
    return this.executionRepo.findBySessionId(sessionId, { limit });
  }

  /**
   * Get a specific execution
   */
  async getExecution(executionId: string): Promise<SandboxExecution> {
    const execution = await this.executionRepo.findById(executionId);
    if (!execution) {
      throw new ApplicationError('NOT_FOUND', `Execution ${executionId} not found`);
    }
    return execution;
  }

  /**
   * Pause a session
   */
  async pauseSession(sessionId: string): Promise<SandboxSession> {
    const session = await this.getSession(sessionId);
    session.pause();
    return this.sessionRepo.update(sessionId, session);
  }

  /**
   * Resume a session
   */
  async resumeSession(sessionId: string): Promise<SandboxSession> {
    const session = await this.getSession(sessionId);
    session.resume();
    return this.sessionRepo.update(sessionId, session);
  }

  /**
   * Terminate a session
   */
  async terminateSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    session.terminate();
    await this.sessionRepo.update(sessionId, session);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.sessionRepo.delete(sessionId);
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    totalExecutionTime: number;
  }> {
    const session = await this.getSession(sessionId);
    const executions = await this.executionRepo.findBySessionId(sessionId);

    const completed = executions.filter((e) => e.isComplete());
    const successful = completed.filter((e) => e.wasSuccessful());
    const failed = completed.filter((e) => !e.wasSuccessful());
    const totalTime = completed.reduce((sum, e) => sum + (e.executionTimeMs || 0), 0);

    return {
      totalExecutions: executions.length,
      successfulExecutions: successful.length,
      failedExecutions: failed.length,
      totalExecutionTime: totalTime,
    };
  }
}
