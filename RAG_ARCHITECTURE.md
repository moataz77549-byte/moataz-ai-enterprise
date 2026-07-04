# RAG Architecture Specification

Retrieval-Augmented Generation design and semantic query routing.

---

## 1. Document Chunking & Embeddings
Files are chunked into overlap blocks, embedded, and saved to Qdrant.
- Chunk size: 500 characters.
- Overlap size: 100 characters.
- Embedding size: 1536 (standard dimensions).

---

## 2. Context Injection Loop
During active assistant query pipelines:
1. Embed prompt inputs.
2. Query Qdrant for top 3 matching chunks within active project.
3. Inject chunk contents into system instruction prompts.
4. Pass consolidated prompts to Universal Gateway adapters.
5. Render citations and document sources in the UI.
