# Security Architecture Specification

This document details the security layers, encryption protocols, access control matrices, and audit systems designed to protect Moataz AI customer data.

---

## 1. Data Encryption Systems

### A. Encryption in Transit
*   **Protocol**: All external and internal network requests must enforce TLS 1.3 (with fallback to TLS 1.2 using secure cipher suites only).
*   **Security Headers**: API routes and web layouts must send these headers to prevent clickjacking, MIME-sniffing, and XSS injections:
    *   `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
    *   `X-Content-Type-Options: nosniff`
    *   `X-Frame-Options: DENY`
    *   `X-XSS-Protection: 1; mode=block`
    *   `Content-Security-Policy`: Restricts scripts, frames, and images loading only to allowed self and trusted domains.

### B. Encryption at Rest
*   **Database Storage**: Supabase PostgreSQL volume partitions are encrypted using AES-256 by the infrastructure engine.
*   **API Key Vault Storage**: Sensitive variables (such as OpenAI, Gemini, and Claude API Keys) are encrypted before insertion into the database.

---

## 2. API Key Vault & Encryption Model

To guarantee key safety, Moataz AI uses symmetric **AES-256-GCM** encryption. Plain text keys are never written to disk or logs.

```text
               [ API KEY ENCRYPTION LIFECYCLE ]

        Plaintext Key  ───┐
                          ▼
    Master Secret Key ───> [ AES-256-GCM Encryption Engine ]
                          │
                          ├─> IV (Initialization Vector - 12 bytes)
                          ├─> Auth Tag (Authentication Tag - 16 bytes)
                          ▼
                   Formatted Ciphertext
             (iv_hex : auth_tag_hex : ciphertext_hex)
                          │
                          ▼
                  Supabase Postgres
```

### Encryption Key Rotation Procedure
To mitigate potential master key exposures, we implement a rotation algorithm:
1.  **Dual Key Registry**: The vault configures both `PRIMARY_ENCRYPTION_KEY` and `PREVIOUS_ENCRYPTION_KEY`.
2.  **Decryption Loop**: During rotation, a background runner reads rows, attempts decryption with the `PRIMARY_ENCRYPTION_KEY` first, and falls back to `PREVIOUS_ENCRYPTION_KEY` if it fails.
3.  **Re-encryption**: Once decrypted, the key is immediately re-encrypted with the newly generated primary key and written back to Postgres.
4.  **Audit Recording**: The rotation script emits an immutable security log entry tracking the number of records migrated.

---

## 3. RBAC & ABAC Access Control Models

Moataz AI controls permissions through a hybrid **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)** matrix.

### Tenant Hierarchy
*   **Organization**: Owns billing contracts and shared assets.
*   **Team**: Workspaces groupings for specific projects.
*   **Project**: Boundaries for data, chats, and vector indexes.

### RBAC Matrix
| Role | Organization Control | Billing Admin | Project Create | Session Read/Write | Guest View |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Owner** | Yes | Yes | Yes | Yes | Yes |
| **Admin** | No | Yes | Yes | Yes | Yes |
| **Member** | No | No | Yes | Yes | Yes |
| **Guest** | No | No | No | No (Read Only) | Yes |

### ABAC Extension
Security intercepts request contexts using dynamic attributes before allowing execute commands:
*   *IP Allowlist*: Access blocks if request origin deviates from organization IP restrictions.
*   *Time Window*: Restricts API keys use outside defined business hours (for enterprise workspaces).
*   *Quota Limit*: Blocks executions if organization's daily budget token spend threshold is exceeded.

---

## 4. Immutable Security Audit Trail

All authorization updates, billing mutations, and Vault decryption events generate an immutable audit record:

```sql
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    action_name VARCHAR(100) NOT NULL, -- e.g., 'VAULT_KEY_DECRYPTED', 'ROLE_MODIFIED'
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    payload_checksum CHAR(64) NOT NULL, -- SHA-256 hash of details for verification
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Deny all update and delete actions on audit logs to ensure immutability
CREATE RULE protect_audit_logs_delete AS ON DELETE TO security_audit_logs DO INSTEAD NOTHING;
CREATE RULE protect_audit_logs_update AS ON UPDATE TO security_audit_logs DO INSTEAD NOTHING;
```
