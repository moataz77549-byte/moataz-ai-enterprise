# Project Brain Specification

The **Project Brain** is the intelligent context workspace encapsulating the memory of a project.

---

## 1. Context Isolation Boundary
Each project represents a strict sandboxed domain:
- Conversations inside Project A cannot view documents or history from Project B.
- Embeddings are filtered by `projectId` during similarity retrieval.

---

## 2. Memory Accumulation Loop
The brain accumulates context via:
- **Relational History**: Serialized message threads in PostgreSQL.
- **Semantic Memory**: Document chunks indexed in Qdrant.
- **Tool History**: Execution audit trails.
- **Dynamic System Prompts**: Registered in the prompt templates library.
