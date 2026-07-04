/**
 * Database Connection Factory
 *
 * This module provides singleton database connection instances
 * compatible with serverless environments (Vercel, Edge).
 * Actual connection implementations will be added in Phase 03
 * when Supabase and Redis adapters are integrated.
 */

export interface IDatabaseConfig {
  connectionString: string;
  maxConnections: number;
  ssl: boolean;
}

export interface ICacheConfig {
  url: string;
  maxRetries: number;
}

export interface IVectorConfig {
  url: string;
  apiKey: string;
  collectionName: string;
}

export interface IConnectionRegistry {
  database: IDatabaseConfig;
  cache: ICacheConfig;
  vector: IVectorConfig;
}

/**
 * Returns a connection configuration object based on environment variables.
 * In Phase 03, this will instantiate actual client connections.
 */
export function getConnectionConfig(): IConnectionRegistry {
  return {
    database: {
      connectionString: process.env.DATABASE_URL ?? '',
      maxConnections: 50,
      ssl: process.env.NODE_ENV === 'production',
    },
    cache: {
      url: process.env.REDIS_URL ?? '',
      maxRetries: 3,
    },
    vector: {
      url: process.env.QDRANT_URL ?? '',
      apiKey: process.env.QDRANT_API_KEY ?? '',
      collectionName: 'project_knowledge_vectors',
    },
  };
}
