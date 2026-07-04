# Operations Runbook

This document details monitoring alerts, log traces, and troubleshooting steps.

---

## 1. System Health Telemetry
Query system metrics via the JSON API routes:
- GET `/api/health`: Uptime and overall system status.
- GET `/api/status`: DB, Redis, and Qdrant links connection testing.
- GET `/api/system`: Node runtime memory allocations and platform load averages.

---

## 2. Common Alert Incident Scenarios

### Incident: Redis Connection Timeout
- **Symptom**: Caching and BullMQ workers report connections timeout errors.
- **Action**: Verify `REDIS_URL` credentials. The platform will fall back safely to local memory caches.

### Incident: Qdrant Index Collection Missing
- **Symptom**: Vector search queries fail.
- **Action**: Check if the collection name `project_knowledge_vectors` exists in your Qdrant console. Run vector sandbox checks from `/knowledge-base` to auto-initialize.
