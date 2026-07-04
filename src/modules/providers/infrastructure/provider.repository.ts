import crypto from 'crypto';
import { encryptKey, decryptKey } from '@core/security/crypto';
import { ApplicationError } from '@shared/errors';
import { supabase } from '@core/database/supabase';
import {
  ICustomProviderRepository,
  CustomProviderInput,
  CustomProviderRecord,
  CustomProviderType,
} from '@shared/ports/repositories';

const DEFAULT_WORKSPACE_ID = '550e8400-e29b-41d4-a716-446655440001';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `provider-${crypto.randomUUID().slice(0, 8)}`
  );
}

class CustomProviderRepository implements ICustomProviderRepository {
  public async list(): Promise<CustomProviderRecord[]> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to list providers: ${error.message}`);
    }

    return (data || []).map(this.mapToRecord);
  }

  public async findById(id: string): Promise<CustomProviderRecord | null> {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new ApplicationError('DATABASE_ERROR', `Failed to find provider: ${error.message}`);
    }

    return this.mapToRecord(data);
  }

  public async getDecryptedApiKey(id: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('providers')
      .select('encrypted_api_key, api_key_iv, api_key_tag')
      .eq('id', id)
      .single();

    if (error || !data.encrypted_api_key) return null;

    try {
      return decryptKey(data.encrypted_api_key, data.api_key_iv, data.api_key_tag);
    } catch {
      throw new ApplicationError('DECRYPTION_ERROR', 'Failed to decrypt provider API key.');
    }
  }

  public async create(input: CustomProviderInput): Promise<CustomProviderRecord> {
    const slug = slugify(input.name);
    
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
    const newRecord = {
      id: crypto.randomUUID(),
      workspace_id: DEFAULT_WORKSPACE_ID,
      slug,
      name: input.name,
      provider_type: input.providerType,
      base_url: input.baseUrl.replace(/\/+$/, ''),
      default_model: input.defaultModel,
      headers: input.headers ?? {},
      capabilities: {
        supportsStreaming: input.capabilities?.supportsStreaming ?? true,
        supportsVision: input.capabilities?.supportsVision ?? false,
        supportsTools: input.capabilities?.supportsTools ?? true,
        supportsReasoning: input.capabilities?.supportsReasoning ?? false,
      },
      auth_header: input.auth_header ?? 'Authorization',
      auth_prefix: input.auth_prefix ?? 'Bearer ',
      timeout_ms: input.timeoutMs ?? 60000,
      max_retries: input.maxRetries ?? 2,
      encrypted_api_key: encryptedApiKey,
      api_key_iv: apiKeyIv,
      api_key_tag: apiKeyTag,
      status: 'enabled',
      connection_status: 'unknown',
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('providers')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to create provider: ${error.message}`);
    }

    return this.mapToRecord(data);
  }

  public async update(id: string, input: Partial<CustomProviderInput>): Promise<CustomProviderRecord> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (input.name) updateData.name = input.name;
    if (input.providerType) updateData.provider_type = input.providerType;
    if (input.baseUrl) updateData.base_url = input.baseUrl.replace(/\/+$/, '');
    if (input.defaultModel) updateData.default_model = input.defaultModel;
    if (input.headers) updateData.headers = input.headers;
    if (input.capabilities) updateData.capabilities = input.capabilities;
    if (input.authHeader) updateData.auth_header = input.authHeader;
    if (input.authPrefix) updateData.auth_prefix = input.authPrefix;
    if (input.timeoutMs) updateData.timeout_ms = input.timeoutMs;
    if (input.maxRetries) updateData.max_retries = input.maxRetries;

    if (input.apiKey) {
      const enc = encryptKey(input.apiKey);
      updateData.encrypted_api_key = enc.encryptedValue;
      updateData.api_key_iv = enc.iv;
      updateData.api_key_tag = enc.tag;
    }

    const { data, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to update provider: ${error.message}`);
    }

    return this.mapToRecord(data);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await supabase.from('providers').delete().eq('id', id);
    if (error) throw new ApplicationError('DATABASE_ERROR', `Failed to delete provider: ${error.message}`);
  }

  public async setEnabled(id: string, enabled: boolean): Promise<void> {
    const { error } = await supabase
      .from('providers')
      .update({ status: enabled ? 'enabled' : 'disabled', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new ApplicationError('DATABASE_ERROR', `Failed to update status: ${error.message}`);
  }

  public async recordHealthCheck(
    id: string,
    result: { status: 'healthy' | 'degraded' | 'down'; latencyMs?: number }
  ): Promise<void> {
    const { error } = await supabase
      .from('providers')
      .update({
        connection_status: result.status,
        last_latency_ms: result.latencyMs,
        last_tested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw new ApplicationError('DATABASE_ERROR', `Failed to record health check: ${error.message}`);
  }

  private mapToRecord(data: any): CustomProviderRecord {
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      providerType: data.provider_type,
      baseUrl: data.base_url,
      defaultModel: data.default_model,
      headers: data.headers,
      capabilities: data.capabilities,
      authHeader: data.auth_header,
      authPrefix: data.auth_prefix,
      timeoutMs: data.timeout_ms,
      maxRetries: data.max_retries,
      status: data.status,
      connectionStatus: data.connection_status,
      lastTestedAt: data.last_tested_at,
      lastLatencyMs: data.last_latency_ms,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      hasApiKey: Boolean(data.encrypted_api_key),
    };
  }
}

export const CustomProviderRepo = new CustomProviderRepository();
