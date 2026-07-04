-- Migration 002: Custom / OpenAI-Compatible Providers
-- Adds persistence for user-defined providers (Universal Provider Platform).
-- Safe to run against an existing database: additive only, no destructive changes.

CREATE TABLE IF NOT EXISTS custom_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(200) NOT NULL,
    provider_type VARCHAR(30) NOT NULL DEFAULT 'openai_compatible'
        CHECK (provider_type IN ('openai_compatible', 'native', 'local', 'custom')),
    base_url TEXT NOT NULL,
    default_model VARCHAR(200),
    headers JSONB DEFAULT '{}'::jsonb,
    capabilities JSONB DEFAULT '{"supportsStreaming":true,"supportsVision":false,"supportsTools":true,"supportsReasoning":false}'::jsonb,
    auth_header VARCHAR(100) DEFAULT 'Authorization',
    auth_prefix VARCHAR(20) DEFAULT 'Bearer ',
    timeout_ms INTEGER DEFAULT 60000,
    max_retries INTEGER DEFAULT 2,
    encrypted_api_key TEXT,
    api_key_iv VARCHAR(64),
    api_key_tag VARCHAR(64),
    status VARCHAR(20) NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled')),
    connection_status VARCHAR(20) NOT NULL DEFAULT 'unknown'
        CHECK (connection_status IN ('unknown', 'healthy', 'degraded', 'down')),
    last_tested_at TIMESTAMP WITH TIME ZONE,
    last_latency_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (workspace_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_custom_providers_workspace ON custom_providers(workspace_id);
CREATE INDEX IF NOT EXISTS idx_custom_providers_status ON custom_providers(status);

CREATE TABLE IF NOT EXISTS provider_health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES custom_providers(id) ON DELETE CASCADE,
    static_provider_id VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
    latency_ms INTEGER,
    error_message TEXT,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provider_health_provider ON provider_health_checks(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_health_checked_at ON provider_health_checks(checked_at);

CREATE TRIGGER update_custom_providers_modtime
    BEFORE UPDATE ON custom_providers
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
