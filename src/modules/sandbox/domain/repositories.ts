/**
 * Sandbox Module - Repository Interfaces
 * 
 * Defines the contracts for sandbox data persistence.
 */

import { SandboxSession, SandboxExecution } from './entities';

export interface ISandboxSessionRepository {
  /**
   * Create a new sandbox session
   */
  create(session: SandboxSession): Promise<SandboxSession>;

  /**
   * Get a session by ID
   */
  findById(id: string): Promise<SandboxSession | null>;

  /**
   * Get all sessions for a workspace
   */
  findByWorkspaceId(workspaceId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<SandboxSession[]>;

  /**
   * Get all sessions for a user
   */
  findByUserId(userId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<SandboxSession[]>;

  /**
   * Update a session
   */
  update(id: string, updates: Partial<SandboxSession>): Promise<SandboxSession>;

  /**
   * Delete a session
   */
  delete(id: string): Promise<void>;

  /**
   * Get active sessions count
   */
  countActive(): Promise<number>;
}

export interface ISandboxExecutionRepository {
  /**
   * Create a new execution
   */
  create(execution: SandboxExecution): Promise<SandboxExecution>;

  /**
   * Get an execution by ID
   */
  findById(id: string): Promise<SandboxExecution | null>;

  /**
   * Get all executions in a session
   */
  findBySessionId(sessionId: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<SandboxExecution[]>;

  /**
   * Update an execution
   */
  update(id: string, updates: Partial<SandboxExecution>): Promise<SandboxExecution>;

  /**
   * Delete an execution
   */
  delete(id: string): Promise<void>;

  /**
   * Get execution count for a session
   */
  countBySessionId(sessionId: string): Promise<number>;

  /**
   * Get the last execution in a session
   */
  getLastExecution(sessionId: string): Promise<SandboxExecution | null>;
}
