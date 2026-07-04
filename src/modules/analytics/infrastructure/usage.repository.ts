import fs from 'fs';
import path from 'path';
import { getModelMetadata } from '../../providers/domain/model.registry';

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

import { IUsageRepository } from '@core/ports/interfaces';

class UsageRepository implements IUsageRepository {
  private localFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'src/shared/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localFile = path.join(dataDir, 'usage.json');
  }

  private readAll(): UsageMetric[] {
    if (!fs.existsSync(this.localFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private writeAll(records: UsageMetric[]): void {
    fs.writeFileSync(this.localFile, JSON.stringify(records, null, 2), 'utf8');
  }

  /**
   * Logs a gateway interaction and computes pricing costs.
   */
  public logUsage(params: {
    requestId: string;
    providerId: string;
    modelId: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    statusCode: number;
    errorCode?: string;
  }): UsageMetric {
    const records = this.readAll();
    const metadata = getModelMetadata(params.modelId);
    
    let estimatedCost = 0;
    if (metadata) {
      estimatedCost = 
        (params.promptTokens * metadata.inputPricePerMillion) / 1000000 +
        (params.completionTokens * metadata.outputPricePerMillion) / 1000000;
    }

    const newRecord: UsageMetric = {
      id: crypto.randomUUID(),
      requestId: params.requestId,
      providerId: params.providerId,
      modelId: params.modelId,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      totalTokens: params.promptTokens + params.completionTokens,
      estimatedCost,
      latencyMs: params.latencyMs,
      statusCode: params.statusCode,
      errorCode: params.errorCode,
      createdAt: new Date().toISOString(),
    };

    records.push(newRecord);
    this.writeAll(records);
    return newRecord;
  }

  /**
   * Retrieves aggregated statistics.
   */
  public getStats(): {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageLatency: number;
  } {
    const records = this.readAll();
    if (records.length === 0) {
      return { totalRequests: 0, totalTokens: 0, totalCost: 0, averageLatency: 0 };
    }

    const totalRequests = records.length;
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCost = records.reduce((sum, r) => sum + r.estimatedCost, 0);
    const totalLatency = records.reduce((sum, r) => sum + r.latencyMs, 0);

    return {
      totalRequests,
      totalTokens,
      totalCost,
      averageLatency: totalLatency / totalRequests,
    };
  }

  /**
   * Returns list of usage records.
   */
  public getHistory(): UsageMetric[] {
    return this.readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export const UsageRepo = new UsageRepository();
export type { UsageRepository };
