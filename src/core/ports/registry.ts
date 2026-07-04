import { IApiKeyRepository, IUsageRepository, IProviderAdapterRegistry, ICustomProviderRepository } from './interfaces';

class Registry {
  private apiKeyRepository?: IApiKeyRepository;
  private usageRepository?: IUsageRepository;
  private adapterRegistry?: IProviderAdapterRegistry;
  private customProviderRepository?: ICustomProviderRepository;

  public registerApiKeyRepository(repo: IApiKeyRepository): void {
    this.apiKeyRepository = repo;
  }

  public getApiKeyRepository(): IApiKeyRepository {
    if (!this.apiKeyRepository) {
      throw new Error('ApiKeyRepository not registered in ServiceRegistry');
    }
    return this.apiKeyRepository;
  }

  public registerUsageRepository(repo: IUsageRepository): void {
    this.usageRepository = repo;
  }

  public getUsageRepository(): IUsageRepository {
    if (!this.usageRepository) {
      throw new Error('UsageRepository not registered in ServiceRegistry');
    }
    return this.usageRepository;
  }

  public registerCustomProviderRepository(repo: ICustomProviderRepository): void {
    this.customProviderRepository = repo;
  }

  public getCustomProviderRepository(): ICustomProviderRepository {
    if (!this.customProviderRepository) {
      throw new Error('CustomProviderRepository not registered in ServiceRegistry');
    }
    return this.customProviderRepository;
  }

  public registerAdapterRegistry(reg: IProviderAdapterRegistry): void {
    this.adapterRegistry = reg;
  }

  public getAdapterRegistry(): IProviderAdapterRegistry {
    if (!this.adapterRegistry) {
      throw new Error('AdapterRegistry not registered in ServiceRegistry');
    }
    return this.adapterRegistry;
  }
}

export const ServiceRegistry = new Registry();
export type { Registry };
