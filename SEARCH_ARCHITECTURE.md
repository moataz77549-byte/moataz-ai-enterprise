# Search Architecture Specification

Unified search routing layers across relational databases and vector semantic indexes.

---

## 1. Unified Search Router
Search inputs trigger multi-source query scans:
- **Database Full-Text Search**: Queries workspaces, projects, chats, messages, files, and templates.
- **Qdrant Vector Similarity Search**: Extracts matching semantic document snippets.

---

## 2. Aggregations
Query matches are returned as standard JSON arrays containing:
- `type`: project, chat, message, file, or knowledge chunk.
- `title`: primary header matching the result.
- `snippet`: content context snippet.
- `score`: similarity ranking for vector results.
