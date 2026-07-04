# Deployment Guide
## Railway Deployment
1. Connect your GitHub repository to Railway.
2. Set the following environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GATEWAY_ENCRYPTION_KEY` (Generate with `openssl rand -hex 32`)
   - `ADMIN_API_TOKEN`
3. The build command is `npm run build`.
4. The start command is `npm run start`.
