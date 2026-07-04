# Redis Architecture Specification

This document details the usage patterns for **Redis** caching, rate limiting, and distributed locks.

---

## 1. Caching Strategies
We maintain three cache namespaces to reduce DB read latencies:
- `gateway:cache:*`: Caches resolved non-streaming chat requests.
- `session:cache:*`: Caches workspace preferences.
- `model:cache:*`: Caches registered model list projections.

---

## 2. Distributed Locking
We enforce lock exclusivity for operations that must happen sequentially (e.g., file processing and token budget deductions) using set options:
```typescript
await redis.set(lockKey, 'locked', 'PX', ttlMs, 'NX');
```

---

## 3. Sliding Window Rate Limiting
Rate limiting keys are checked against timestamps logs:
- Request counts are incremented and pruned using sorted sets (`ZREMRANGEBYSCORE`).
