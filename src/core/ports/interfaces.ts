import { IProviderAdapter } from '@modules/ai-gateway/domain/adapter.interface';
import {
  IApiKeyRepository as IApiKeyRepoShared,
  ICustomProviderRepository as ICustomProviderRepoShared,
} from '@shared/ports/repositories';

export interface IApiKeyRepository extends IApiKeyRepoShared {}
export interface ICustomProviderRepository extends ICustomProviderRepoShared {}

export interface IUsageRepository {
  logUsage(params: {
    requestId: string;
    providerId: string;
    modelId: string;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    statusCode: number;
    errorCode?: string;
  }): any;
}

export interface IProviderAdapterRegistry {
  getAdapter(providerId: string): IProviderAdapter | undefined;
}
