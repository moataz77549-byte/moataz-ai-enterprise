import crypto from 'crypto';
import { encryptKey, decryptKey } from '@core/security/crypto';
import { ApplicationError } from '@shared/errors';
import { supabase } from '@core/database/supabase';
import { IApiKeyRepository } from '@core/ports/interfaces';

export interface ApiKeyRecord {
  id: string;
  providerId: string;
  name: string;
  encryptedValue: string;
  iv: string;
  tag: string;
  status: 'enabled' | 'disabled';
  lastTestedAt?: string;
  createdAt: string;
}

const DEFAULT_WORKSPACE_ID = '550e8400-e29b-41d4-a716-446655440001';

class ApiKeyRepository implements IApiKeyRepository {
  public async addKey(providerId: string, name: string, plainValue: string): Promise<ApiKeyRecord> {
    const encrypted = encryptKey(plainValue);
    
    const newRecord = {
      id: crypto.randomUUID(),
      workspace_id: DEFAULT_WORKSPACE_ID,
      provider_id: providerId,
      name,
      encrypted_value: encrypted.encryptedValue,
      iv: encrypted.iv,
      tag: encrypted.tag,
      status: 'enabled',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('api_keys_vault')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      console.error('Supabase error adding key:', error);
      throw new ApplicationError('DATABASE_ERROR', `Failed to save API key: ${error.message}`);
    }

    return this.mapToRecord(data);
  }

  public async getDecryptedKey(providerId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('api_keys_vault')
      .select('*')
      .eq('provider_id', providerId)
      .eq('status', 'enabled')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new ApplicationError('DATABASE_ERROR', `Failed to fetch API key: ${error.message}`);
    }
    
    try {
      return decryptKey(data.encrypted_value, data.iv, data.tag);
    } catch (e) {
      throw new ApplicationError('DECRYPTION_ERROR', 'Failed to decrypt API key credentials.');
    }
  }

  public async listKeys(): Promise<Array<Omit<ApiKeyRecord, 'encryptedValue' | 'iv' | 'tag'>>> {
    const { data, error } = await supabase
      .from('api_keys_vault')
      .select('id, provider_id, name, status, last_tested_at, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApplicationError('DATABASE_ERROR', `Failed to list API keys: ${error.message}`);
    }

    return (data || []).map(item => ({
      id: item.id,
      providerId: item.provider_id,
      name: item.name,
      status: item.status as 'enabled' | 'disabled',
      lastTestedAt: item.last_tested_at,
      createdAt: item.created_at,
    }));
  }

  public async deleteKey(id: string): Promise<void> {
    const { error } = await supabase.from('api_keys_vault').delete().eq('id', id);
    if (error) throw new ApplicationError('DATABASE_ERROR', `Failed to delete API key: ${error.message}`);
  }

  public async toggleKeyStatus(id: string): Promise<void> {
    const { data: current } = await supabase.from('api_keys_vault').select('status').eq('id', id).single();
    if (!current) return;
    const { error } = await supabase.from('api_keys_vault').update({ status: current.status === 'enabled' ? 'disabled' : 'enabled' }).eq('id', id);
    if (error) throw new ApplicationError('DATABASE_ERROR', `Failed to update status: ${error.message}`);
  }

  private mapToRecord(data: any): ApiKeyRecord {
    return {
      id: data.id,
      providerId: data.provider_id,
      name: data.name,
      encryptedValue: data.encrypted_value,
      iv: data.iv,
      tag: data.tag,
      status: data.status,
      lastTestedAt: data.last_tested_at,
      createdAt: data.created_at,
    };
  }
}

export const ApiKeyRepo = new ApiKeyRepository();
