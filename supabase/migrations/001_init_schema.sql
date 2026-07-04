-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- 3. Providers (Custom/OpenAI Compatible)
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  provider_type TEXT NOT NULL, -- 'openai_compatible', 'local', 'custom'
  base_url TEXT NOT NULL,
  default_model TEXT,
  headers JSONB DEFAULT '{}',
  capabilities JSONB DEFAULT '{}',
  auth_header TEXT DEFAULT 'Authorization',
  auth_prefix TEXT DEFAULT 'Bearer ',
  timeout_ms INTEGER DEFAULT 60000,
  max_retries INTEGER DEFAULT 2,
  encrypted_api_key TEXT,
  api_key_iv TEXT,
  api_key_tag TEXT,
  status TEXT DEFAULT 'enabled',
  connection_status TEXT DEFAULT 'unknown',
  last_latency_ms INTEGER,
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

-- 4. API Keys Vault (For Native Providers)
CREATE TABLE IF NOT EXISTS api_keys_vault (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL, -- 'openai', 'gemini', etc.
  name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  tag TEXT NOT NULL,
  status TEXT DEFAULT 'enabled',
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. API Call Logs (Analytics)
CREATE TABLE IF NOT EXISTS api_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  model_id TEXT NOT NULL,
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10, 6) DEFAULT 0,
  latency_ms INTEGER DEFAULT 0,
  status_code INTEGER,
  error_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Chat Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  provider_id TEXT,
  model_id TEXT,
  temperature FLOAT DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 4096,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chat Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Sandbox Sessions
CREATE TABLE IF NOT EXISTS sandbox_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID,
  runtime TEXT NOT NULL, -- 'python', 'nodejs', 'bash'
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 9. Sandbox Executions
CREATE TABLE IF NOT EXISTS sandbox_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sandbox_sessions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  output TEXT,
  error TEXT,
  exit_code INTEGER,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sandbox_executions ENABLE ROW LEVEL SECURITY;

-- Create Public Access Policies (For Demo/Initial Setup)
-- NOTE: In production, these should be restricted to authenticated users only.
CREATE POLICY "Public Read" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public Write" ON organizations FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read" ON workspaces FOR SELECT USING (true);
CREATE POLICY "Public Write" ON workspaces FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read" ON providers FOR SELECT USING (true);
CREATE POLICY "Public Write" ON providers FOR ALL USING (true);

CREATE POLICY "Public Read" ON api_keys_vault FOR SELECT USING (true);
CREATE POLICY "Public Write" ON api_keys_vault FOR ALL USING (true);

CREATE POLICY "Public Read" ON api_call_logs FOR SELECT USING (true);
CREATE POLICY "Public Write" ON api_call_logs FOR ALL USING (true);

CREATE POLICY "Public Read" ON conversations FOR SELECT USING (true);
CREATE POLICY "Public Write" ON conversations FOR ALL USING (true);

CREATE POLICY "Public Read" ON messages FOR SELECT USING (true);
CREATE POLICY "Public Write" ON messages FOR ALL USING (true);

CREATE POLICY "Public Read" ON sandbox_sessions FOR SELECT USING (true);
CREATE POLICY "Public Write" ON sandbox_sessions FOR ALL USING (true);

CREATE POLICY "Public Read" ON sandbox_executions FOR SELECT USING (true);
CREATE POLICY "Public Write" ON sandbox_executions FOR ALL USING (true);

-- Insert Default Organization and Workspace
INSERT INTO organizations (id, name, slug) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Default Org', 'default-org')
ON CONFLICT DO NOTHING;

INSERT INTO workspaces (id, organization_id, name, slug) 
VALUES ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Default Workspace', 'default')
ON CONFLICT DO NOTHING;
