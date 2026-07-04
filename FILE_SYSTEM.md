# File System Architecture

Object storage configurations and file tracking models.

---

## 1. Storage Buckets
We store documents in Supabase Storage buckets or fall back to local disk directories:
- Supabase storage: `/moataz-ai-knowledge`.
- Local fallback upload paths: `/src/shared/data/uploads`.

---

## 2. Security & Verification
File uploads are verified by extension, checked for size boundaries, and queued for virus scanning.
- Only permitted formats are accepted (PDF, DOC, TXT, MD, CSV).
