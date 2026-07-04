# Storage Architecture Specification

This document details the file upload and asset distribution layers of **Moataz AI**.

---

## 1. Storage Providers
We use **Supabase Storage** as the primary object storage engine:
- Bucket name: `moataz-ai-knowledge`.
- Storage directory format: `projects/{projectId}/files/{fileId}-{name}`.

---

## 2. Directory Layout
Files are organized by projects and folders:
- Documents, images, archives, datasets, attachments, and user files are written using isolated paths.
- Local uploads fallback directory is located under `src/shared/data/uploads`.
