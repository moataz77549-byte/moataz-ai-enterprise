import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { encryptKey, decryptKey } from '@core/security/crypto';
import { ApplicationError } from '@shared/errors';
import {
  ICustomProviderRepository,
  CustomProviderInput,
  CustomProviderRecord,
  CustomProviderType,
} from '@shared/ports/repositories';

interface StoredProvider {
  id: string;
  slug: string;
  name: string;
  providerType: CustomProviderType;
  baseUrl: string;
  defaultModel?: string;
  headers: Record<string, string>;
  capabilities: {
    supportsStreaming: boolean;
    supportsVision: boolean;
    supportsTools: boolean;
    supportsReasoning: boolean;
  };
  authHeader: string;
  authPrefix: string;
  timeoutMs: number;
  maxRetries: number;
  encryptedApiKey?: string;
  apiKeyIv?: string;
  apiKeyTag?: string;
  status: 'enabled' | 'disabled';
  connectionStatus: 'unknown' | 'healthy' | 'degraded' | 'down';
  lastTestedAt?: string;
  lastLatencyMs?: number;
  createdAt: string;
  updatedAt: string;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `provider-${crypto.randomUUID().slice(0, 8)}`
  );
}

function toRecord(p: StoredProvider): CustomProviderRecord {
  const { encryptedApiKey, apiKeyIv, apiKeyTag, ...rest } = p;
  return { ...rest, hasApiKey: Boolean(encryptedApiKey) };
}

class CustomProviderRepository implements ICustomProviderRepository {
  private localFile: string;

  constructor() {
    const dataDir = path.join(process.cwd(), 'src/shared/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localFile = path.join(dataDir, 'custom-providers.json');
  }

  private readAll(): StoredProvider[] {
    if (!fs.existsSync(this.localFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private writeAll(records: StoredProvider[]): void {
    fs.writeFileSync(this.localFile, JSON.stringify(records, null, 2), 'utf8');
  }

  public async list(): Promise<CustomProviderRecord[]> {
    return this.readAll().map(toRecord);
  }

  public async findById(id: string): Promise<CustomProviderRecord | null> {
    const found = this.readAll().find((p) => p.id === id);
    return found ? toRecord(found) : null;
  }

  public async getDecryptedApiKey(id: string): Promise<string | null> {
    const p = this.readAll().find((r) => r.id === id);
    if (!p || !p.encryptedApiKey || !p.apiKeyIv || !p.apiKeyTag) return null;
    try {
      return decryptKey(p.encryptedApiKey, p.apiKeyIv, p.apiKeyTag);
    } catch {
      throw new ApplicationError('DECRYPTION_ERROR', 'Failed to decrypt provider API key.');
    }
  }

  public async create(input: CustomProviderInput): Promise<CustomProviderRecord> {
    const records = this.readAll();
    const baseSlug = slugify(input.name);
    let slug = baseSlug;
    let suffix = 1;
    while (records.some((r) => r.slug === slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }

    let encryptedApiKey: string | undefined;
    let apiKeyIv: string | undefined;
    let apiKeyTag: string | undefined;
    if (input.apiKey) {
      const enc = encryptKey(input.apiKey);
      encryptedApiKey = enc.encryptedValue;
      apiKeyIv = enc.iv;
      apiKeyTag = enc.tag;
    }

    const now = new Date().toISOString();
    const record: StoredProvider = {
      id: crypto.randomUUID(),
      slug,
      name: input.name,
      providerType: input.providerType,
      baseUrl: input.baseUrl.replace(/\/+$/, ''),
      defaultModel: input.defaultModel,
      headers: input.headers ?? {},
      capabilities: {
        supportsStreaming: input.capabilities?.supportsStreaming ?? true,
        supportsVision: input.capabilities?.supportsVision ?? false,
        supportsTools: input.capabilities?.supportsTools ?? true,
        supportsReasoning: input.capabilities?.supportsReasoning ?? false,
      },
      authHeader: input.authHeader ?? 'Authorization',
      authPrefix: input.authPrefix ?? 'Bearer ',
      timeoutMs: input.timeoutMs ?? 60000,
      maxRetries: input.maxRetries ?? 2,
      encryptedApiKey,
      apiKeyIv,
      apiKeyTag,
      status: 'enabled',
      connectionStatus: 'unknown',
      createdAt: now,
      updatedAt: now,
    };

    records.push(record);
    this.writeAll(records);
    return toRecord(record);
  }

  public async update(id: string, input: Partial<CustomProviderInput>): Promise<CustomProviderRecord> {
    const records = this.readAll();
    const index = records.findIndex((r) => r.id === id);
    if (index === -1) throw new ApplicationError('NOT_FOUND', 'Provider not found.');

    const existing = records[index];
    if (input.apiKey) {
      const enc = encryptKey(input.apiKey);
      existing.encryptedApiKey = enc.encryptedValue;
      existing.apiKeyIv = enc.iv;
      existing.apiKeyTag = enc.tag;
    }

    records[index] = {
      ...existing,
      name: input.name ?? existing.name,
      providerType: input.providerType ?? existing.providerType,
      baseUrl: input.baseUrl ? input.baseUrl.replace(/\/+$/, '') : existing.baseUrl,
      defaultModel: input.defaultModel ?? existing.defaultModel,
      headers: input.headers ?? existing.headers,
      capabilities: { ...existing.capabilities, ...input.capabilities },
      authHeader: input.authHeader ?? existing.authHeader,
      authPrefix: input.authPrefix ?? existing.authPrefix,
      timeoutMs: input.timeoutMs ?? existing.timeoutMs,
      maxRetries: input.maxRetries ?? existing.maxRetries,
      updatedAt: new Date().toISOString(),
    };

    this.writeAll(records);
    return toRecord(records[index]);
  }

  public async delete(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((r) => r.id !== id));
  }

  public async setEnabled(id: string, enabled: boolean): Promise<void> {
    const records = this.readAll();
    const index = records.findIndex((r) => r.id === id);
    if (index !== -1) {
      records[index].status = enabled ? 'enabled' : 'disabled';
      records[index].updatedAt = new Date().toISOString();
      this.writeAll(records);
    }
  }

  public async recordHealthCheck(
    id: string,
    result: { status: 'healthy' | 'degraded' | 'down'; latencyMs?: number }
  ): Promise<void> {
    const records = this.readAll();
    const index = records.findIndex((r) => r.id === id);
    if (index !== -1) {
      records[index].connectionStatus = result.status;
      records[index].lastLatencyMs = result.latencyMs;
      records[index].lastTestedAt = new Date().toISOString();
      this.writeAll(records);
    }
  }
}

export const CustomProviderRepo = new CustomProviderRepository();
