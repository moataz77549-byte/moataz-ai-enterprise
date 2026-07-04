# Qdrant Vector Database Architecture

This document outlines our semantic vector search strategy using **Qdrant**.

---

## 1. Collections Setup
We utilize a single centralized collection `project_knowledge_vectors`:
- **Vector dimension**: 1536 float elements (standard size for text embeddings).
- **Distance Metric**: Cosine Similarity.

---

## 2. Payload Metadata Filters
Each point stored contains structured payloads:
```json
{
  "fileId": "uuid-string",
  "projectId": "uuid-string",
  "chunkIndex": 12,
  "content": "Raw chunk text segment..."
}
```
Queries use metadata match filters to isolate search results to the active project boundary:
```json
{
  "must": [
    { "key": "projectId", "match": { "value": "uuid-of-project" } }
  ]
}
```
This guarantees zero data cross-leakage between tenant projects.
