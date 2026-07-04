-- Moataz AI Database DDL Schema

-- 1. Providers Table
CREATE TABLE IF NOT EXISTS providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, degraded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Models Table
CREATE TABLE IF NOT EXISTS models (
    id VARCHAR(100) PRIMARY KEY,
    provider_id VARCHAR(50) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    context_window INT NOT NULL,
    streaming BOOLEAN NOT NULL DEFAULT TRUE,
    vision BOOLEAN NOT NULL DEFAULT FALSE,
    tools BOOLEAN NOT NULL DEFAULT FALSE,
    reasoning BOOLEAN NOT NULL DEFAULT FALSE,
    json_mode BOOLEAN NOT NULL DEFAULT FALSE,
    input_price_per_million DECIMAL(10, 4) NOT NULL,
    output_price_per_million DECIMAL(10, 4) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, deprecated, unavailable
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. API Keys Table (Encrypted)
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id VARCHAR(50) NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    encrypted_value TEXT NOT NULL,
    iv VARCHAR(64) NOT NULL, -- Initialisation Vector for AES-256-GCM
    tag VARCHAR(64) NOT NULL, -- Auth Tag for AES-256-GCM
    status VARCHAR(20) NOT NULL DEFAULT 'enabled', -- enabled, disabled
    last_tested_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Gateway Usage Logs
CREATE TABLE IF NOT EXISTS gateway_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(100) NOT NULL UNIQUE,
    provider_id VARCHAR(50) NOT NULL,
    model_id VARCHAR(100) NOT NULL,
    status_code INT NOT NULL,
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    estimated_cost DECIMAL(12, 6) NOT NULL DEFAULT 0.000000,
    latency_ms INT NOT NULL,
    error_code VARCHAR(50),
    error_message TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Routing History
CREATE TABLE IF NOT EXISTS routing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(100) NOT NULL,
    selected_model_id VARCHAR(100) NOT NULL,
    routing_strategy VARCHAR(50) NOT NULL, -- manual, cost, latency, quality, fallback
    latency_ms INT,
    estimated_cost DECIMAL(12, 6),
    status VARCHAR(20) NOT NULL DEFAULT 'success', -- success, failed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Quick Analytics & Diagnostics
CREATE INDEX IF NOT EXISTS idx_models_provider ON models(provider_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_gateway_logs_created_at ON gateway_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_gateway_logs_provider ON gateway_logs(provider_id);
CREATE INDEX IF NOT EXISTS idx_gateway_logs_model ON gateway_logs(model_id);
CREATE INDEX IF NOT EXISTS idx_routing_history_request ON routing_history(request_id);
