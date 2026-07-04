# Moataz AI — Production Deployment Guide

A step-by-step operations guide to deploying Moataz AI into cloud environments.

---

## 1. Hosting Environment
We deploy our Next.js shell onto **Vercel** or **Docker** servers:
- Database: **Supabase PostgreSQL** cloud instance.
- Vector search: **Qdrant Cloud** instance.
- Caching: **Upstash Redis** or **ElastiCache Redis** instance.

---

## 2. Environment Variables Specification
Configure the following secrets in your deployment vault:
```env
# Encryption
GATEWAY_ENCRYPTION_KEY=your-32-byte-encryption-key-secret

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1Ni...

# Caching
REDIS_URL=rediss://default:password@your-redis-endpoint.com:6379

# Vector Index
QDRANT_URL=https://your-qdrant-cluster.com
QDRANT_API_KEY=your-qdrant-secret-key
```
---

## 3. Production Build Commands
Compile and package the application:
```bash
npm install
npm run build
```
Ensure lint and typecheck compilation passes with zero failures.
