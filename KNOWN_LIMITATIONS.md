# Known Limitations — Alpha Release

This document outlines limitations of the Alpha release (v1.0.0-alpha.0) and planned fixes.

---

## 1. Local Fallback Persistence
- **Limitation**: When `SUPABASE_URL` or `REDIS_URL` are not configured, database, vector search, and background queues fallback to memory/JSON files storage.
- **Fix**: Configure environment variables in the `.env` settings to enable persistent database connections.

---

## 2. Text Parser Embeddings
- **Limitation**: Large image documents or complex layouts require OCR preprocessing models. The local fallback simply extracts raw text buffers.
- **Fix**: Connect external OCR processors (e.g. Tesseract or Cloud OCR APIs) inside the BullMQ job worker.
