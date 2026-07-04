# Supabase Architecture Specification

This document details the configuration and usage guidelines for the **Supabase** backend.

---

## 1. Client Configurations
We instantiate a standard client wrapper with pooled credentials:
- In Server / Serverless functions, we use `@supabase/supabase-js`.
- Session persistence is disabled for stateless API operations.

---

## 2. Row Level Security (RLS) Policies
Each table under Phase 04 enforces row-level security:
```sql
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
```
For workspaces, RLS policies dictate that users can only select data if their user ID matches members in the workspace.

---

## 3. Realtime Capabilities
We utilize Supabase Realtime Channels to broadcast message updates in collaborative workspaces, avoiding long-polling overhead.
