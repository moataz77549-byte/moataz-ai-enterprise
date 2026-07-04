# Moataz AI — Developer Playbook & Git Strategy

This document details the environment configuration, development setup, and Git collaboration workflows for the Moataz AI team.

---

## 1. Local Development Setup

### System Prerequisites
*   Node.js v20.0.0 or higher.
*   Package Manager: `npm` or `pnpm` (configured inside `package.json`).

### Environment Variables Template
Create a local `.env.local` file. Do NOT commit this file to git. Use the following structured format:

```bash
# ==============================================================================
# Moataz AI Enterprise Environment Configuration Template
# ==============================================================================

# Core System Ports
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Security Vault Master Keys (Must be 64-character hexadecimal strings)
# Generate via: node -e "console.log(crypto.randomBytes(32).toString('hex'))"
SECRET_ENCRYPTION_MASTER_KEY=8f63c8a9142f1f513c1c8da741a26d7f8d9b0e2f5b61e2f3d4c5b6a7f8e9c0a1

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Caching Configuration
REDIS_URL=redis://:password@localhost:6379

# Vector Embeddings Configurations
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-secret-key

# Telemetry and Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://...
```

---

## 2. Git Branching Strategy

We enforce a strict Git-Flow variant to coordinate changes across development and release targets.

```text
                  [ GIT BRANCHING TOPOLOGY ]

      ┌─────────────────────────────────────────────────┐
      │               main (Production)                 │
      └─────────────────────────────────────────────────┘
                              ▲
                              │  (Release deployment merges)
      ┌─────────────────────────────────────────────────┐
      │               release/x.y.z                     │
      └─────────────────────────────────────────────────┘
                              ▲
                              │  (Staging/stabilization checks)
      ┌─────────────────────────────────────────────────┐
      │               develop (Integration)             │
      └─────────────────────────────────────────────────┘
          ▲                                         ▲
          │ (Feature merges)                        │ (Hotfix direct patch)
      ┌─────────────────┐                       ┌─────────────────┐
      │    feature/*    │                       │    hotfix/*     │
      └─────────────────┘                       └─────────────────┘
```

### Branch Definitions & Rules
1.  **`main`**:
    *   *Rule*: Production-ready code. Direct commits are forbidden. Every merge is tagged with a release version (e.g. `v1.0.0`).
2.  **`develop`**:
    *   *Rule*: Primary integration branch. All developers merge feature branches here. Must always compile and pass tests.
3.  **`feature/*`**:
    *   *Rule*: Isolated feature work (e.g., `feature/ai-gateway-gemini`). Spawned from `develop`, merged back to `develop` via Approved Pull Request.
4.  **`release/*`**:
    *   *Rule*: Release preparation and stabilization branch (e.g., `release/v1.1.0`). Merged to `main` and `develop` after QA passes.
5.  **`hotfix/*`**:
    *   *Rule*: Production emergencies. Spawned directly from `main` to address bugs, merged immediately back to both `main` and `develop`.

---

## 3. Commit Message Standards (Conventional Commits)

Commit messages must follow the Conventional Commits specification:

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Supported Commit Types
*   `feat`: A new user-facing feature.
*   `fix`: A bug fix.
*   `docs`: Documentation changes.
*   `style`: Formatting, semi-colons, lint fixes (no logic changes).
*   `refactor`: Code restructuring that neither fixes a bug nor adds a feature.
*   `test`: Adding missing tests or correcting existing ones.
*   `chore`: Updating build scripts, config files, package dependencies.

### Commit Examples
*   *Correct*: `feat(gateway): add adapter implementation interface for DeepSeek`
*   *Correct*: `fix(security): sanitize api key input to prevent injection`
*   *Incorrect*: `fixed stuff`
*   *Incorrect*: `added new gemini changes`
