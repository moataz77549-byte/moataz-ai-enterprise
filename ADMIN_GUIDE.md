# Moataz AI — Administrator Guide

Administration controls, key vault rotation, and system telemetry tracking.

---

## 1. Credentials Rotation
To rotate or test provider credentials:
1. Log in as an administrator.
2. Navigate to **Settings** -> **Secure API Keys Vault**.
3. Select the target provider and click **Add Key**. The system runs connection test checks before saving.

---

## 2. Platform Monitoring & Status Checks
Check system status dashboards from `/status` to view connection latency of databases and Redis caching servers.
- Monitor `/api/system` to ensure memory heaps remain stable under high workloads.
- Check background jobs logs using GET `/api/queue/status`.
