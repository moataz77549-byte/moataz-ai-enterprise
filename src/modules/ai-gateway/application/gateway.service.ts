import { Router, RouteOptions } from './model-router';
import { RateLimiter } from './rate-limiter';
import { CacheManager } from './cache-manager';
import { getModelMetadata } from '../../providers/domain/model.registry';
import { withRetries } from './retry-handler';
import { GatewayChatRequest, GatewayChatResponse, GatewayStreamChunk } from '../domain/adapter.interface';
import { ApplicationError } from '@shared/errors';
import { ServiceRegistry } from '@core/ports/registry';

export interface GatewayOptions extends RouteOptions {
  bypassCache?: boolean;
  ttlMs?: number;
  userId?: string;
}

class UniversalGatewayService {
  /**
   * Main chat completions handler.
   */
  public async chat(request: GatewayChatRequest, options: GatewayOptions = { strategy: 'manual' }): Promise<GatewayChatResponse> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const userIdentifier = options.userId || 'anonymous-user';

    // 1. Rate Limiting check
    if (RateLimiter.isRateLimited(userIdentifier)) {
      throw new ApplicationError('RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.');
    }

    // 2. Resolve Model Routing
    const resolvedModelId = Router.resolveModel(request.model, options);
    const metadata = getModelMetadata(resolvedModelId);
    if (!metadata) {
      throw new ApplicationError('ROUTING_ERROR', `Resolved model ${resolvedModelId} has no registry metadata.`);
    }

    const modifiedRequest = { ...request, model: resolvedModelId };

    // 3. Cache lookup
    if (!options.bypassCache && !request.stream) {
      const cached = CacheManager.get(modifiedRequest);
      if (cached) {
        return cached;
      }
    }

    // 4. Resolve Adapter & Encryption keys
    const adapter = ServiceRegistry.getAdapterRegistry().getAdapter(metadata.providerId);
    if (!adapter) {
      throw new ApplicationError('PROVIDER_NOT_SUPPORTED', `No adapter found for provider ${metadata.providerId}`);
    }

    const apiKey = await ServiceRegistry.getApiKeyRepository().getDecryptedKey(metadata.providerId);
    if (!apiKey) {
      throw new ApplicationError('API_KEY_MISSING', `No active API key registered for provider: ${metadata.providerId}`);
    }

    try {
      // 5. Execute with Retries
      const response = await withRetries(() => adapter.chat(modifiedRequest, apiKey));

      const latencyMs = Date.now() - startTime;

      // 6. Write Cache & Usage Audit logs
      if (!request.stream) {
        CacheManager.set(modifiedRequest, response, options.ttlMs);
      }

      ServiceRegistry.getUsageRepository().logUsage({
        requestId,
        providerId: metadata.providerId,
        modelId: resolvedModelId,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        latencyMs,
        statusCode: 200,
      });

      return response;
    } catch (error: any) {
      const latencyMs = Date.now() - startTime;
      ServiceRegistry.getUsageRepository().logUsage({
        requestId,
        providerId: metadata.providerId,
        modelId: resolvedModelId,
        promptTokens: 0,
        completionTokens: 0,
        latencyMs,
        statusCode: 500,
        errorCode: error.code || 'GATEWAY_ERROR',
      });
      throw error;
    }
  }

  /**
   * Main streaming completions handler.
   */
  public async stream(request: GatewayChatRequest, options: GatewayOptions = { strategy: 'manual' }): Promise<ReadableStream<GatewayStreamChunk>> {
    const userIdentifier = options.userId || 'anonymous-user';

    // 1. Rate Limiting check
    if (RateLimiter.isRateLimited(userIdentifier)) {
      throw new ApplicationError('RATE_LIMIT_EXCEEDED', 'Too many requests. Please try again later.');
    }

    // 2. Resolve Model Routing
    const resolvedModelId = Router.resolveModel(request.model, options);
    const metadata = getModelMetadata(resolvedModelId);
    if (!metadata) {
      throw new ApplicationError('ROUTING_ERROR', `Resolved model ${resolvedModelId} has no registry metadata.`);
    }

    const modifiedRequest = { ...request, model: resolvedModelId, stream: true };

    // 3. Resolve Adapter & Encryption keys
    const adapter = ServiceRegistry.getAdapterRegistry().getAdapter(metadata.providerId);
    if (!adapter) {
      throw new ApplicationError('PROVIDER_NOT_SUPPORTED', `No adapter found for provider ${metadata.providerId}`);
    }

    const apiKey = await ServiceRegistry.getApiKeyRepository().getDecryptedKey(metadata.providerId);
    if (!apiKey) {
      throw new ApplicationError('API_KEY_MISSING', `No active API key registered for provider: ${metadata.providerId}`);
    }

    return adapter.stream(modifiedRequest, apiKey);
  }
}

export const Gateway = new UniversalGatewayService();
export type { UniversalGatewayService };
