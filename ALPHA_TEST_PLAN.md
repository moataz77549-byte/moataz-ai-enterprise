# Alpha Release Test Plan

Testing strategies, health checks, and validation cases for Moataz AI.

---

## 1. Automated Integration Tests
Automated checks are executed via standard shell builds:
- `npm run lint`: Verifies ESLint rule constraints.
- `npx tsc --noEmit`: Verifies TypeScript compiler typings.
- `npm run build`: Validates Next.js compilation bundles.

---

## 2. Manual Quality Checklist
Validate the following alpha workflows prior to deployment:
1. **Settings**: Navigate to `/settings` and toggle languages (AR/EN) and themes (Light/Dark).
2. **Key Rotation**: Rotate and test connection credentials in the vault.
3. **Project Isolation**: Create a Project under `/projects` and verify its statistics.
4. **File manager**: Upload a `.txt` document under `/files` and verify its indexing status transitions (`uploaded` -> `scanning` -> `indexed`).
5. **RAG Search**: Query keywords in the vector sandbox on `/knowledge-base` and verify match scores.
6. **Chat Page**: Run streaming chat completion queries in `/chat`.
7. **System Status**: Access `/status` to view operational diagnostics.
