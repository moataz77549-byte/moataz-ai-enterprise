# Observability & Monitoring Specification

This document details the telemetry tracking, metric collection, and dashboard logging frameworks configured for Moataz AI.

---

## 1. Metrics & Instrumentation Architecture

Moataz AI integrates full-stack observability layers to monitor performance SLAs and user activities in real time:

```text
               [ OBSERVABILITY DATA COLLECTION ]

       Next.js App Router  ──> [ OpenTelemetry API ] ──> Prometheus Collector
                                                               │
       Serverless Runtimes ──> [ Sentry SDK ]        ──> Sentry Cloud (Traces)
                                                               │
       Client Interactions ──> [ PostHog SDK ]       ──> PostHog Analytics
```

*   **OpenTelemetry**: Standardizes custom spans and metrics for backend gateway processing and database queries.
*   **Prometheus / Grafana**: Collects server-level metrics (CPU, RAM, active websocket counts) and displays them on centralized graphs.
*   **Sentry**: Monitors application runtime crashes, server errors, and memory leaks.
*   **PostHog**: Tracks user flows (e.g. workspace creation, provider addition) to analyze product engagement.

---

## 2. OpenTelemetry Integration Layout

Telemetry instrumentation is initialized under `src/core/observability/`:

```typescript
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'moataz-ai-gateway',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
  }),
  metricReader: new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics',
  }) as any
});
```

---

## 3. Grafana Core Metric Dashboards

Grafana dashboards scrape data from Prometheus endpoints to track five critical service indicators:

1.  **AI Gateway Latency**: P90, P95, and P99 latency times in milliseconds.
2.  **Provider Outages**: Percentages of successful request calls vs failed returns per provider (OpenAI, Gemini, Anthropic).
3.  **Token Cost Metrics**: Real-time dollar spent summaries aggregated from prompt token metrics.
4.  **Queue Backlog Size**: Number of active, delayed, and failed jobs inside BullMQ Redis keyspaces.
5.  **Serverless Memory Bloat**: RAM usage of Vercel routes execution threads.

---

## 4. Uptime Kuma Health Check Points

Uptime Kuma monitors service health from external regional servers:
*   `GET /api/health`: Main public route confirming Next.js server capability and database pings.
*   `GET /api/health/redis`: Internal route verifying cache connectivity and cluster state.
*   `GET /api/health/qdrant`: Confirms vector cluster responses in under 100ms.
*   *Notification Alert Triggers*: If any health check fails for 3 consecutive sweeps (15-second intervals), Uptime Kuma automatically alerts the Operations team via Slack and PageDuty.
