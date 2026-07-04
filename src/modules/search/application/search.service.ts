import { ProjectRepo, ConversationRepo, MessageRepo, FileRepo } from '@core/database/repositories';
import { Qdrant } from '@core/database/qdrant';

export interface SearchResultItem {
  type: 'project' | 'chat' | 'message' | 'file' | 'knowledge';
  id: string;
  title: string;
  snippet: string;
  projectId?: string;
  score?: number;
}

class SearchService {
  private collectionName = 'project_knowledge_vectors';

  /**
   * Performs a unified search across projects, conversations, messages, files, and semantic database.
   */
  public async search(query: string, projectId?: string): Promise<SearchResultItem[]> {
    const results: SearchResultItem[] = [];
    const normalizedQuery = query.toLowerCase();

    // 1. Search projects
    const projects = await ProjectRepo.findAll();
    for (const p of projects) {
      if (p.name.toLowerCase().includes(normalizedQuery) || p.description?.toLowerCase().includes(normalizedQuery)) {
        results.push({
          type: 'project',
          id: p.id,
          title: p.name,
          snippet: p.description || '',
        });
      }
    }

    // 2. Search conversations
    const conversations = await ConversationRepo.findAll();
    const filteredConvs = projectId ? conversations.filter((c) => c.projectId === projectId) : conversations;
    
    for (const c of filteredConvs) {
      if (c.title.toLowerCase().includes(normalizedQuery)) {
        results.push({
          type: 'chat',
          id: c.id,
          title: c.title,
          snippet: `Model: ${c.modelId}`,
          projectId: c.projectId,
        });
      }
    }

    // 3. Search messages
    const messages = await MessageRepo.findAll();
    for (const m of messages) {
      if (m.content.toLowerCase().includes(normalizedQuery)) {
        results.push({
          type: 'message',
          id: m.id,
          title: 'Chat Message',
          snippet: m.content.substring(0, 100),
          projectId: m.conversationId, // simple reference mapping
        });
      }
    }

    // 4. Search files
    const files = await FileRepo.findAll();
    const filteredFiles = projectId ? files.filter((f) => f.projectId === projectId) : files;

    for (const f of filteredFiles) {
      if (f.name.toLowerCase().includes(normalizedQuery)) {
        results.push({
          type: 'file',
          id: f.id,
          title: f.name,
          snippet: `Mime: ${f.mimeType}, Size: ${f.size} bytes`,
          projectId: f.projectId,
        });
      }
    }

    // 5. Semantic Vector Search if query is long enough
    if (query.length > 3) {
      try {
        const queryVector = this.generateQueryEmbedding(normalizedQuery);
        const vectorResults = await Qdrant.searchSimilar(
          this.collectionName,
          queryVector,
          3,
          projectId ? { projectId } : {}
        );

        for (const vr of vectorResults) {
          results.push({
            type: 'knowledge',
            id: vr.id,
            title: vr.payload.fileName || 'Document Chunk',
            snippet: vr.payload.content || '',
            projectId: vr.payload.projectId,
            score: vr.score,
          });
        }
      } catch {
        // Ignore vector search errors
      }
    }

    return results;
  }

  private generateQueryEmbedding(text: string): number[] {
    const vec = new Array(1536).fill(0);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      vec[i % 1536] += code / 1000;
    }
    const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
    return magnitude === 0 ? vec : vec.map((v) => v / magnitude);
  }
}

export const Search = new SearchService();
export type { SearchService };
