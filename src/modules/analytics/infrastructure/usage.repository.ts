import { getModelMetadata } from '../../providers/domain/model.registry';
import { supabase } from '@core/database/supabase';
import { IUsageRepository } from '@core/ports/interfaces';
import { ApplicationError } from '@shared/errors';

export interface UsageMetric {
  id: string;
  requestId: string;
  providerId: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  latencyMs: number;
  statusCode: number;
  errorCode?: string;
  createdAt: string;
}

class UsageRepository implements IUsageRepository {
  /**
   * Logs a gateway interaction and computes pricing costs to Supabase.
   */
  public async logUsage(params: {
    requestId: string;
    providerId: string;
    modelId: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    statusCode: number;
    errorCode?: string;
  }): Promise<UsageMetric> {
    const metadata = getModelMetadata(params.modelId);
    
    let estimatedCost = 0;
    if (metadata) {
      estimatedCost = 
        (params.promptTokens * metadata.inputPricePerMillion) / 1000000 +
        (params.completionTokens * metadata.outputPricePerMillion) / 1000000;
    }

    const newRecord = {
      id: crypto.randomUUID(),
      request_id: params.requestId,
      provider_id: params.providerId,
      model_id: params.modelId,
      prompt_tokens: params.promptTokens,
      completion_tokens: params.completionTokens,
      total_tokens: params.promptTokens + params.completionTokens,
      estimated_cost: estimatedCost,
      latency_ms: params.latencyMs,
      status_code: params.statusCode,
      error_code: params.errorCode,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('api_call_logs')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('Supabase error logging usage:', error);
      throw new ApplicationError('DATABASE_ERROR', `Failed to log usage: ${error.message}`);
    }

    return this.mapToMetric(data);
  }

  /**
   * Retrieves aggregated statistics from Supabase.
   */
  public async getStats(): Promise<{
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
  }> {
    const { data, error } = await supabase
      .from('api_call_logs')
      .select('total_tokens, estimated_cost, latency_ms');

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch stats: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0 };
    }

    const totalRequests = data.length;
    const totalTokens = data.reduce((sum, r) => sum + (r.total_tokens || 0), 0);
    const totalCost = data.reduce((sum, r) => sum + (r.estimated_cost || 0), 0);
    const totalLatency = data.reduce((sum, r) => sum + (r.latency_ms || 0), 0);

    return {
      totalRequests,
      totalTokens,
      totalCost,
      averageLatency: totalLatency / totalRequests,
    };
  }

  /**
   * Returns list of usage records from Supabase.
   */
  public async getHistory(): Promise<UsageMetric[]> {
    const { data, error } = await supabase
      .from('api_call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch history: ${error.message}`);
    }

    return (data || []).map(item => this.mapToMetric(item));
  }

  private mapToMetric(data: any): UsageMetric {
    return {
      id: data.id,
      requestId: data.request_id,
      providerId: data.provider_id,
      modelId: data.model_id,
      promptTokens: data.prompt_tokens,
      completionTokens: data.completion_tokens,
      totalTokens: data.total_tokens,
      estimatedCost: data.estimated_cost,
      latencyMs: data.latency_ms,
      statusCode: data.status_code,
      errorCode: data.error_code,
      createdAt: data.created_at,
    };
  }
}

export const UsageRepo = new UsageRepository();
export type { UsageRepository };
