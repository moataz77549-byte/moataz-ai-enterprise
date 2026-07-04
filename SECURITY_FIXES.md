# Security & Correctness Fixes — July 2026

This documents everything changed during this audit pass. It is honest about scope:
these are real fixes to real problems, not a claim that the project is now
enterprise-hardened. See "Not fixed / still needed" at the bottom.

## Fixed

### 1. Hardcoded encryption key fallback (Critical)
`src/core/security/crypto.ts` used a hardcoded default key
(`'moataz-ai-default-32-byte-key-321'`) whenever `GATEWAY_ENCRYPTION_KEY` wasn't
set. Since this file is source-visible, anyone could decrypt every API key ever
stored if the app ran without that env var configured.
**Fix:** the app now throws at startup if `GATEWAY_ENCRYPTION_KEY` is missing or
too short. No fallback key exists anymore. See `.env.example`.

### 2. Unauthenticated sensitive API routes (Critical)
`/api/keys`, `/api/storage/upload`, `/api/system`, and others had zero auth
checks — anyone with the URL could list/add/delete stored API keys or upload
files.
**Fix:** added `src/middleware.ts`, a bearer-token gate (`ADMIN_API_TOKEN`) in
front of all sensitive `/api/*` routes. `/api/health`, `/api/status`, and
`/api/version` remain open (needed for uptime checks, expose no sensitive data).
This is a stopgap, not full auth — see below.

### 3. API key store not excluded from git (Critical)
`src/shared/data/keys.json` and `files.json` (local fallback storage) were not
in `.gitignore`, meaning encrypted key material could end up committed.
**Fix:** `.gitignore` now excludes `src/shared/data/*.json` and
`src/shared/data/uploads/`.

### 4. Fake embeddings in the RAG pipeline (High)
`pipeline.service.ts` generated a deterministic vector from character codes
instead of a real embedding, so knowledge-base semantic search returned
essentially random results while appearing to work.
**Fix:** now calls OpenAI's `/v1/embeddings` endpoint using the user's stored
OpenAI key. If no OpenAI key is configured, indexing fails with a clear error
instead of silently producing garbage vectors.

### 5. Virus scan was fully mocked (High)
The pipeline logged "running security scan" and always proceeded — no scan
ever happened, for any file, ever.
**Fix:** `scanFile()` now calls a configurable `VIRUS_SCAN_API_URL` if set. If
unset, the file is indexed but `metadata.scanStatus` is explicitly recorded as
`not_scanned_no_scanner_configured` instead of implying a scan occurred. If a
configured scanner is unreachable, the file is rejected (fails closed).

### 6. Unsanitized filenames → path traversal risk (High)
Uploaded filenames were used directly in filesystem and storage paths
(e.g. `../../etc/passwd` style names were not stripped).
**Fix:** added `sanitizeFileName()` in `storage.service.ts`, used everywhere a
filename touches a path.

### 7. No file size/type limits on upload (High)
`/api/storage/upload` accepted any file of any size or type.
**Fix:** added a 25MB size cap and a MIME-type allowlist.

### 8. Silent placeholder Supabase config (Medium)
`supabase.ts` fell back to `placeholder-url.supabase.co` if env vars were
missing, which fails mysteriously later instead of clearly at startup.
**Fix:** throws immediately if `SUPABASE_URL` / `SUPABASE_ANON_KEY` are unset.

### 9. Tool parameter validation was a stub (Medium)
`tool.registry.ts` only checked that required keys existed, never their types
— a tool declaring `count: number` would run fine with `count: "banana"`.
**Fix:** `validateArgs()` now checks declared JSON-schema `type` per property.

### 10. Implicit `crypto` global (Low, latent bug)
`storage.service.ts` and `pipeline.service.ts` called `crypto.randomUUID()`
without importing `crypto` — works on Node 19+ via the global, but breaks on
older Node or non-Node runtimes (e.g. edge).
**Fix:** added explicit `import crypto from 'crypto'` in both files.

### 11. Missing `.env.example`
There was no documentation of required environment variables anywhere.
**Fix:** added `.env.example` listing every variable this app reads, including
the new ones from fixes above.

---

## Not fixed / still needed (be aware of these)

- **No real user authentication.** The `ADMIN_API_TOKEN` middleware is a
  stopgap for a single shared secret, not multi-user auth with sessions,
  roles, or per-user data isolation. If this becomes a multi-tenant SaaS
  product, it needs a real auth system (e.g. Supabase Auth) before real users
  touch it.
- **No rate limiting.** Nothing stops repeated requests from hammering the
  embeddings API (cost) or the upload endpoint (disk).
- **PDF/DOC parsing is still a plain-text placeholder** (`pipeline.service.ts`
  reads the raw buffer as UTF-8 text) — binary formats like real PDFs/DOCX
  will produce garbage chunks, not an error, so results will look wrong
  without an obvious failure.
- **~23 remaining `: any` type annotations** across the codebase reduce
  TypeScript's usefulness in those spots; not fixed in this pass since they're
  scattered and mostly non-security.
- **I could not run `npm install`, `build`, `lint`, `typecheck`, or connect to
  Supabase/Redis/Qdrant** in this environment (no network egress), so none of
  these fixes have been compiled or executed — only read carefully and
  reasoned through. Run `npm install && npm run typecheck && npm run build`
  yourself before deploying.
