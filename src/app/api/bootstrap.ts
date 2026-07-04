import { ServiceRegistry } from '@core/ports/registry';
import { ApiKeyRepo } from '@modules/api-keys/infrastructure/api-key.repository';
import { UsageRepo } from '@modules/analytics/infrastructure/usage.repository';
import { AdapterRegistry, registerCustomProvider } from '@modules/ai-gateway/infrastructure/adapters';
import { CustomProviderRepo } from '@modules/providers/infrastructure/provider.repository';

let bootstrapped = false;

export async function ensureBootstrapped() {
  if (bootstrapped) return;
  ServiceRegistry.registerApiKeyRepository(ApiKeyRepo);
  ServiceRegistry.registerUsageRepository(UsageRepo);
  ServiceRegistry.registerAdapterRegistry(AdapterRegistry);
  ServiceRegistry.registerCustomProviderRepository(CustomProviderRepo);

  // Hydrate every saved OpenAI-compatible / local / custom provider into the
  // live adapter registry so the gateway can route to it immediately.
  try {
    const providers = await CustomProviderRepo.list();
    for (const p of providers.filter((p) => p.status === 'enabled')) {
      registerCustomProvider({
        id: p.slug,
        name: p.name,
        baseUrl: p.baseUrl,
        headers: p.headers,
        timeoutMs: p.timeoutMs,
        maxRetries: p.maxRetries,
        authHeader: p.authHeader,
        authPrefix: p.authPrefix,
        capabilities: p.capabilities,
      });
    }
  } catch (e) {
    console.error('Failed to hydrate custom providers on boot:', e);
  }

  bootstrapped = true;
}
