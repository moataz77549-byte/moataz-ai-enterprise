import { ApiKeyRepo as ConcreteApiKeyRepo } from '@modules/api-keys/infrastructure/api-key.repository';
import { IApiKeyRepository } from '@shared/ports/repositories';

export const ApiKeyRepo: IApiKeyRepository = ConcreteApiKeyRepo;
