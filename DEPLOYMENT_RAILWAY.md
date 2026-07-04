# Deployment Guide - Railway

This guide covers deploying Moataz AI Enterprise to Railway.

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Prepare all required secrets

## Quick Start

### 1. Connect GitHub Repository

```bash
# Login to Railway CLI
railway login

# Initialize Railway project
railway init
```

### 2. Set Environment Variables

In Railway dashboard, add the following environment variables:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Security
GATEWAY_ENCRYPTION_KEY=<generate-with: openssl rand -hex 32>
ADMIN_API_TOKEN=<generate-with: openssl rand -hex 32>

# Optional Services
REDIS_URL=redis://your-redis-url
QDRANT_URL=http://your-qdrant-url
QDRANT_API_KEY=your-qdrant-key
```

### 3. Deploy

```bash
# Deploy using Railway CLI
railway up

# Or push to GitHub and Railway will auto-deploy
git push origin main
```

## Database Setup

### Supabase Migrations

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note the URL and API keys

2. **Run Migrations**:
   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually execute SQL
   # Copy content from supabase/migrations/001_init_schema.sql
   # Paste into Supabase SQL Editor
   ```

3. **Verify Tables**:
   - Check that all tables are created
   - Verify RLS policies are enabled

## Redis Setup (Optional)

For production caching and job queues:

1. **Add Redis Service in Railway**:
   - Click "Add Service" in Railway dashboard
   - Select "Redis"
   - Connect it to your project

2. **Update Environment**:
   - Railway will automatically set `REDIS_URL`

## Monitoring

### Health Checks

The application exposes health check endpoints:

```bash
# Basic health check
curl https://your-app.railway.app/api/health

# Detailed status
curl https://your-app.railway.app/api/status
```

### Logs

View logs in Railway dashboard:
1. Go to your project
2. Click "Logs" tab
3. Filter by service

### Metrics

Monitor in Railway dashboard:
- CPU usage
- Memory usage
- Network I/O
- Request count

## Troubleshooting

### Build Failures

**Issue**: Build fails with "npm install" errors

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment Variable Issues

**Issue**: "GATEWAY_ENCRYPTION_KEY environment variable is not set"

**Solution**:
1. Go to Railway dashboard
2. Select your service
3. Click "Variables"
4. Add all required environment variables
5. Redeploy

### Database Connection Issues

**Issue**: "Failed to connect to Supabase"

**Solution**:
1. Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
2. Check Supabase project is active
3. Verify network access in Supabase settings
4. Check RLS policies aren't blocking connections

### Memory Issues

**Issue**: Application crashes with "out of memory"

**Solution**:
1. Upgrade Railway plan for more memory
2. Optimize database queries
3. Enable Redis caching
4. Reduce batch sizes in background jobs

## Performance Optimization

### 1. Enable Caching

```env
REDIS_URL=redis://your-redis-url
```

### 2. Database Optimization

- Ensure all indexes are created
- Monitor slow queries
- Use connection pooling

### 3. CDN Configuration

- Enable Railway's CDN for static assets
- Configure cache headers in Next.js

## Security

### 1. HTTPS

- Railway automatically provides HTTPS
- All traffic is encrypted

### 2. Secrets Management

- Never commit `.env.local` to GitHub
- Use Railway's secrets manager
- Rotate keys regularly

### 3. Database Security

- Enable Row Level Security (RLS) in Supabase
- Use service role key only for backend
- Restrict API key permissions

## Scaling

### Horizontal Scaling

```bash
# In Railway dashboard:
# 1. Go to your service
# 2. Click "Settings"
# 3. Increase "Replica Count"
```

### Vertical Scaling

```bash
# Increase memory/CPU:
# 1. Go to your service
# 2. Click "Settings"
# 3. Upgrade plan
```

## Backup & Recovery

### Database Backups

Supabase automatically backs up your database:
1. Go to Supabase dashboard
2. Click "Backups"
3. Download backup if needed

### Application Recovery

If deployment fails:
```bash
# Rollback to previous version
railway rollback

# Or redeploy specific commit
railway deploy --commit <commit-hash>
```

## Continuous Deployment

### GitHub Integration

1. Connect GitHub repository to Railway
2. Railway automatically deploys on push to `main`
3. View deployment status in GitHub Actions

### Manual Deployment

```bash
# Deploy from CLI
railway up

# Deploy with custom message
railway up --message "Deploy v1.0.0"
```

## Cost Optimization

1. **Use Railway's free tier** for development
2. **Combine services** (Railway + Supabase + Redis)
3. **Monitor usage** in Railway dashboard
4. **Optimize queries** to reduce database load
5. **Enable caching** to reduce API calls

## Support

- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: Report bugs on GitHub
- **Community**: Join Railway Discord

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Configure Supabase
3. ✅ Set up monitoring
4. ✅ Configure CI/CD
5. ✅ Enable backups
6. ✅ Monitor performance
