import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { encryptKey, decryptKey } from '@core/security/crypto';
import { ApplicationError } from '@shared/errors';

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

import { IApiKeyRepository } from '@core/ports/interfaces';

class ApiKeyRepository implements IApiKeyRepository {
  private localFile: string;

  constructor() {
    // Persistent local file storage mock fallback for standalone serverless runtimes
    const dataDir = path.join(process.cwd(), 'src/shared/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localFile = path.join(dataDir, 'keys.json');
  }

  private readAll(): ApiKeyRecord[] {
    if (!fs.existsSync(this.localFile)) return [];
    try {
      return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    } catch {
      return [];
    }
  }

  private writeAll(records: ApiKeyRecord[]): void {
    fs.writeFileSync(this.localFile, JSON.stringify(records, null, 2), 'utf8');
  }

  /**
   * Adds a new API key securely encrypted.
   */
  public async addKey(providerId: string, name: string, plainValue: string): Promise<ApiKeyRecord> {
    const encrypted = encryptKey(plainValue);
    const records = this.readAll();

    const newRecord: ApiKeyRecord = {
      id: crypto.randomUUID(),
      providerId,
      name,
      encryptedValue: encrypted.encryptedValue,
      iv: encrypted.iv,
      tag: encrypted.tag,
      status: 'enabled',
      createdAt: new Date().toISOString(),
    };

    records.push(newRecord);
    this.writeAll(records);
    return newRecord;
  }

  /**
   * Retrieves and decrypts the key for a provider.
   */
  public async getDecryptedKey(providerId: string): Promise<string | null> {
    const record = this.readAll().find((r) => r.providerId === providerId && r.status === 'enabled');
    if (!record) return null;
    
    try {
      return decryptKey(record.encryptedValue, record.iv, record.tag);
    } catch (e) {
      throw new ApplicationError('DECRYPTION_ERROR', 'Failed to decrypt API key credentials.');
    }
  }

  /**
   * Lists all stored keys with secrets removed.
   */
  public async listKeys(): Promise<Array<Omit<ApiKeyRecord, 'encryptedValue' | 'iv' | 'tag'>>> {
    return this.readAll().map(({ encryptedValue, iv, tag, ...rest }) => rest);
  }

  /**
   * Deletes a key record by ID.
   */
  public async deleteKey(id: string): Promise<void> {
    const records = this.readAll().filter((r) => r.id !== id);
    this.writeAll(records);
  }

  /**
   * Toggles status (enabled/disabled).
   */
  public async toggleKeyStatus(id: string): Promise<void> {
    const records = this.readAll();
    const index = records.findIndex((r) => r.id === id);
    if (index !== -1) {
      records[index].status = records[index].status === 'enabled' ? 'disabled' : 'enabled';
      this.writeAll(records);
    }
  }
}

export const ApiKeyRepo = new ApiKeyRepository();
export type { ApiKeyRepository };
