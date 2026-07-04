# Moataz AI — Alpha Release Specification

This document details the Alpha version (v1.0.0-alpha.0) release notes, objectives, and test checklist guidelines.

---

## 1. Release Goals
The first public Alpha release prepares a fully usable sandbox environment for the AI SaaS Platform, integrating:
- Universal AI Gateway routing parameters across OpenAI, Claude, Gemini, DeepSeek.
- Workspace Projects isolation boundaries.
- File manager uploads with automatic Qdrant vector embedding indexing pipeline.
- Streaming SSE chat UI interfaces.

---

## 2. Release Configuration Checklist
- Ensure `GATEWAY_ENCRYPTION_KEY` is configured in production vault.
- Ensure Supabase object storage bucket permissions allow read/write uploads.
- Run typecheck and ESLint checks prior to release merges.
