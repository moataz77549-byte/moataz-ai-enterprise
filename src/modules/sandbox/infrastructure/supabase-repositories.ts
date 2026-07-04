/**
 * Sandbox Module - Supabase Repository Implementations
 * 
 * Concrete implementations of the sandbox repositories using Supabase.
 */

import { supabase } from '@core/database/supabase';
import { SandboxSession, SandboxExecution, RuntimeType, SessionStatus, ExecutionStatus } from '../domain/entities';
import { ISandboxSessionRepository, ISandboxExecutionRepository } from '../domain/repositories';
import { ApplicationError } from '@shared/errors';

export class SupabaseSandboxSessionRepository implements ISandboxSessionRepository {
  async create(session: SandboxSession): Promise<SandboxSession> {
    const { data, error } = await supabase
      .from('sandbox_sessions')
      .insert({
        id: session.id,
        workspace_id: session.workspaceId,
        user_id: session.userId,
        runtime: session.runtime,
        status: session.status,
        created_at: session.createdAt.toISOString(),
        updated_at: session.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to create session: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<SandboxSession | null> {
    const { data, error } = await supabase
      .from('sandbox_sessions')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch session: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async findByWorkspaceId(
    workspaceId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<SandboxSession[]> {
    let query = supabase
      .from('sandbox_sessions')
      .select()
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch sessions: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<SandboxSession[]> {
    let query = supabase
      .from('sandbox_sessions')
      .select()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch sessions: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async update(id: string, updates: Partial<SandboxSession>): Promise<SandboxSession> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('sandbox_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to update session: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('sandbox_sessions').delete().eq('id', id);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to delete session: ${error.message}`);
    }
  }

  async countActive(): Promise<number> {
    const { count, error } = await supabase
      .from('sandbox_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to count sessions: ${error.message}`);
    }

    return count || 0;
  }

  private mapToEntity(data: any): SandboxSession {
    return new SandboxSession(
      data.id,
      data.workspace_id,
      data.user_id,
      data.runtime as RuntimeType,
      (data.status as SessionStatus) || SessionStatus.ACTIVE,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}

export class SupabaseSandboxExecutionRepository implements ISandboxExecutionRepository {
  async create(execution: SandboxExecution): Promise<SandboxExecution> {
    const { data, error } = await supabase
      .from('sandbox_executions')
      .insert({
        id: execution.id,
        session_id: execution.sessionId,
        code: execution.code,
        status: execution.status,
        output: execution.output,
        error_output: execution.errorOutput,
        exit_code: execution.exitCode,
        execution_time_ms: execution.executionTimeMs,
        created_at: execution.createdAt.toISOString(),
        completed_at: execution.completedAt?.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to create execution: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<SandboxExecution | null> {
    const { data, error } = await supabase
      .from('sandbox_executions')
      .select()
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch execution: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  async findBySessionId(
    sessionId: string,
    options?: { limit?: number; offset?: number }
  ): Promise<SandboxExecution[]> {
    let query = supabase
      .from('sandbox_executions')
      .select()
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch executions: ${error.message}`);
    }

    return (data || []).map((row) => this.mapToEntity(row));
  }

  async update(id: string, updates: Partial<SandboxExecution>): Promise<SandboxExecution> {
    const updateData: any = {};
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.output !== undefined) updateData.output = updates.output;
    if (updates.errorOutput !== undefined) updateData.error_output = updates.errorOutput;
    if (updates.exitCode !== undefined) updateData.exit_code = updates.exitCode;
    if (updates.executionTimeMs !== undefined) updateData.execution_time_ms = updates.executionTimeMs;
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString();

    const { data, error } = await supabase
      .from('sandbox_executions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to update execution: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('sandbox_executions').delete().eq('id', id);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to delete execution: ${error.message}`);
    }
  }

  async countBySessionId(sessionId: string): Promise<number> {
    const { count, error } = await supabase
      .from('sandbox_executions')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to count executions: ${error.message}`);
    }

    return count || 0;
  }

  async getLastExecution(sessionId: string): Promise<SandboxExecution | null> {
    const { data, error } = await supabase
      .from('sandbox_executions')
      .select()
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch last execution: ${error.message}`);
    }

    return data ? this.mapToEntity(data) : null;
  }

  private mapToEntity(data: any): SandboxExecution {
    return new SandboxExecution(
      data.id,
      data.session_id,
      data.code,
      (data.status as ExecutionStatus) || ExecutionStatus.PENDING,
      data.output || '',
      data.error_output || '',
      data.exit_code,
      data.execution_time_ms,
      new Date(data.created_at),
      data.completed_at ? new Date(data.completed_at) : undefined
    );
  }
}
