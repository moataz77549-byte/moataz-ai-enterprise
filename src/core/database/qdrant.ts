import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

interface VectorRecord {
  id: string;
  vector: number[];
  payload: Record<string, any>;
}

class QdrantService {
  private client: QdrantClient | null = null;
  private memoryIndex: Map<string, VectorRecord[]> = new Map();

  constructor() {
    if (qdrantUrl) {
      try {
        this.client = new QdrantClient({
          url: qdrantUrl,
          apiKey: qdrantApiKey,
        });
      } catch (err) {
        console.warn('Failed to initialize Qdrant client, using local memory index fallback.');
      }
    } else {
      console.warn('QDRANT_URL not configured. Using local in-memory fallback vector index.');
    }
  }

  /**
   * Initializes a vector collection if not existing.
   */
  public async initCollection(collectionName: string, vectorSize = 1536): Promise<void> {
    if (this.client) {
      try {
        const collections = await this.client.getCollections();
        const exists = collections.collections.some((c) => c.name === collectionName);
        if (!exists) {
          await this.client.createCollection(collectionName, {
            vectors: {
              size: vectorSize,
              distance: 'Cosine',
            },
          });
        }
        return;
      } catch {
        // Fallback
      }
    }
    
    if (!this.memoryIndex.has(collectionName)) {
      this.memoryIndex.set(collectionName, []);
    }
  }

  /**
   * Upsert vector points into the collection.
   */
  public async upsertPoints(
    collectionName: string,
    points: Array<{ id: string; vector: number[]; payload: Record<string, any> }>
  ): Promise<void> {
    if (this.client) {
      try {
        await this.client.upsert(collectionName, {
          wait: true,
          points: points.map((p) => ({
            id: p.id,
            vector: p.vector,
            payload: p.payload,
          })),
        });
        return;
      } catch {
        // Fallback
      }
    }

    const collection = this.memoryIndex.get(collectionName) || [];
    for (const p of points) {
      const existingIdx = collection.findIndex((item) => item.id === p.id);
      if (existingIdx !== -1) {
        collection[existingIdx] = p;
      } else {
        collection.push(p);
      }
    }
    this.memoryIndex.set(collectionName, collection);
  }

  /**
   * Searches for similar vector points matching input query embeddings.
   */
  public async searchSimilar(
    collectionName: string,
    queryVector: number[],
    limit = 5,
    filter: Record<string, any> = {}
  ): Promise<Array<{ id: string; score: number; payload: Record<string, any> }>> {
    if (this.client) {
      try {
        const results = await this.client.search(collectionName, {
          vector: queryVector,
          limit,
          filter: {
            must: Object.entries(filter).map(([key, value]) => ({
              key,
              match: { value },
            })),
          },
        });
        return results.map((r) => ({
          id: r.id as string,
          score: r.score,
          payload: r.payload || {},
        }));
      } catch {
        // Fallback
      }
    }

    // In-memory Cosine similarity fallback ranking
    const collection = this.memoryIndex.get(collectionName) || [];
    const filtered = collection.filter((item) => {
      for (const [k, v] of Object.entries(filter)) {
        if (item.payload[k] !== v) return false;
      }
      return true;
    });

    const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
      let dotProduct = 0.0;
      let normA = 0.0;
      let normB = 0.0;
      for (let i = 0; i < Math.min(vecA.length, vecB.length); i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
      }
      if (normA === 0 || normB === 0) return 0;
      return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    const ranked = filtered
      .map((item) => ({
        id: item.id,
        score: cosineSimilarity(queryVector, item.vector),
        payload: item.payload,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return ranked;
  }
}

export const Qdrant = new QdrantService();
export type { QdrantService };
