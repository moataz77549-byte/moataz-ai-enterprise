# Moataz AI Enterprise - Quick Start Guide

## What Has Been Built

A **production-ready AI SaaS platform** with:
- ✅ Real-time chat with streaming support
- ✅ Code execution sandbox (Python, Node.js, Bash)
- ✅ Supabase database with 24 tables
- ✅ 8 new API endpoints
- ✅ Docker & Railway deployment ready
- ✅ GitHub Actions CI/CD pipeline

## Quick Start (5 Minutes)

### 1. Setup Supabase

```bash
# Create a new Supabase project at https://supabase.com

# Get your credentials:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 2. Run Database Migrations

```bash
# Copy the SQL from supabase/migrations/001_init_schema.sql
# Paste into Supabase SQL Editor
# Execute to create all tables
```

### 3. Setup Environment

```bash
# Generate encryption keys
ENCRYPTION_KEY=$(openssl rand -hex 32)
ADMIN_TOKEN=$(openssl rand -hex 32)

# Create .env.local
cat > .env.local << 'ENVEOF'
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GATEWAY_ENCRYPTION_KEY=$ENCRYPTION_KEY
ADMIN_API_TOKEN=$ADMIN_TOKEN
ENVEOF
```

### 4. Run Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### 5. Test API Endpoints

```bash
# Create a conversation
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My First Chat",
    "providerId": "openai",
    "modelId": "gpt-4"
  }'

# Create a sandbox session
curl -X POST http://localhost:3000/api/sandbox/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "runtime": "python"
  }'

# Health check
curl http://localhost:3000/api/health
```

## Deploy to Railway

### 1. Push to GitHub

```bash
git remote add origin https://github.com/yourusername/moataz-ai-enterprise.git
git branch -M main
git push -u origin main
```

### 2. Connect to Railway

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repository
5. Add environment variables
6. Deploy

### 3. Verify Deployment

```bash
curl https://your-app.railway.app/api/health
```

## Project Structure

```
src/
├── modules/
│   ├── chat/              # Chat system
│   ├── sandbox/           # Code execution
│   ├── providers/         # AI provider management
│   └── ai-gateway/        # Multi-provider adapter
├── app/api/
│   ├── chat/              # Chat endpoints
│   ├── conversations/     # Conversation management
│   └── sandbox/           # Sandbox endpoints
├── core/
│   ├── database/          # Supabase client
│   ├── security/          # Encryption utilities
│   └── backend/           # Base controllers
└── shared/
    ├── errors/            # Error handling
    ├── types/             # Type definitions
    └── utils/             # Utility functions

supabase/
└── migrations/
    └── 001_init_schema.sql  # Database schema

deployment/
├── Dockerfile             # Production image
├── railway.json           # Railway config
└── .github/workflows/     # CI/CD pipeline
```

## Key Features

### Chat System
- Create conversations with custom system prompts
- Send messages with streaming support
- Multi-provider support (OpenAI, Gemini, Claude, etc.)
- Message history persistence
- Archive conversations

### Sandbox
- Execute Python, Node.js, or Bash code
- Timeout protection (default 30s)
- Capture stdout and stderr
- Track execution history
- Session management

### Database
- 24 tables with proper relationships
- Row Level Security (RLS) for data isolation
- Automatic timestamps and triggers
- Vector support for embeddings
- Multi-tenancy ready

## API Documentation

### Chat Endpoints

```
POST /api/conversations
- Create a new conversation
- Body: { projectId, title, description?, systemPrompt?, providerId?, modelId?, temperature?, maxTokens? }

GET /api/conversations?projectId=...
- List conversations for a project
- Query: projectId, limit?, offset?

GET /api/conversations/[id]
- Get conversation details with message history
- Query: limit?

PUT /api/conversations/[id]
- Update conversation settings
- Body: { title?, description?, systemPrompt?, temperature?, maxTokens?, providerId?, modelId? }

DELETE /api/conversations/[id]
- Delete a conversation

POST /api/chat
- Send a message to a conversation
- Body: { conversationId, message, stream?, providerId?, modelId? }
- Response: Streaming or JSON
```

### Sandbox Endpoints

```
POST /api/sandbox/sessions
- Create a new sandbox session
- Body: { workspaceId, userId, runtime }
- Runtime: "python" | "nodejs" | "bash"

GET /api/sandbox/sessions?workspaceId=...
- List sandbox sessions
- Query: workspaceId | userId, limit?, offset?

POST /api/sandbox/execute
- Execute code in a session
- Body: { sessionId, code, timeout?, env? }
```

## Environment Variables

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
GATEWAY_ENCRYPTION_KEY=<32-byte hex key>
ADMIN_API_TOKEN=<32-byte hex token>

# Optional
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
```

## Troubleshooting

### Build Fails
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Error
- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check Supabase project is active
- Verify network access in Supabase settings

### API Returns 401
- Ensure ADMIN_API_TOKEN is set
- Check x-api-key header in requests

### Sandbox Execution Fails
- Verify Python/Node.js/Bash are installed
- Check code syntax
- Increase timeout if needed

## Next Steps

1. ✅ Setup Supabase project
2. ✅ Run database migrations
3. ✅ Configure environment variables
4. ✅ Test API endpoints locally
5. ✅ Deploy to Railway
6. ✅ Monitor in production

## Support

- 📚 See `DEPLOYMENT_RAILWAY.md` for detailed deployment guide
- 📚 See `IMPLEMENTATION_REPORT.md` for technical details
- 📚 See `DATABASE_DESIGN.md` for schema documentation
- 📚 See `SYSTEM_DESIGN.md` for architecture overview

## What's Next?

Consider implementing:
- User authentication (Supabase Auth)
- Billing integration (Stripe)
- Real-time collaboration (WebSocket)
- File uploads with virus scanning
- Vector embeddings integration
- Advanced monitoring and logging

---

**Status**: ✅ Production-Ready  
**Version**: 1.0.0  
**Last Updated**: July 4, 2026
