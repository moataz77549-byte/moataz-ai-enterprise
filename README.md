# Moataz AI — Enterprise Project Foundation & Blueprints

Welcome to the foundation of **Moataz AI**, a production-grade, enterprise-scale AI SaaS Platform designed to unify connections to multiple AI providers under a single, highly performant, and secure portal. This repository contains the complete modular architecture skeletons, configuration files, and system designs.

---

## Technical Stack Overview

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ / React 19 / TypeScript (Strict Mode) | Web application layer and route handlings. |
| **Styling & UI** | Tailwind CSS / Framer Motion | Fluid animations, styling, and RTL/LTR interfaces. |
| **Relational Storage**| Supabase PostgreSQL | Transactional workspace and configuration data. |
| **Transient Storage** | Redis | Caching, rate limiting, and BullMQ queues backing. |
| **Vector DB** | Qdrant | RAG similarity vectors and semantic memory. |
| **File Storage** | Supabase Storage | Document bucket systems for OCR and RAG ingestion. |
| **Observability** | OpenTelemetry / Sentry / PostHog | Dynamic performance trace tracking and monitoring. |

---

## Hybrid Modular Clean Architecture

To support codebases exceeding 500,000 lines of code, Moataz AI implements a **Hybrid Architecture** combining:
1.  **Feature-Based Modules**: Grouping logic by business domain (e.g. Chat, Workspace, Brain) to keep files cohesive.
2.  **Clean Architecture**: Splitting each feature module internally into `domain`, `application`, `infrastructure`, and `presentation` layers to decouple business logic from delivery mechanisms.
3.  **Core Systems Isolation**: Core services like Events Bus, Queue pipelines, and encryption vaults reside under `src/core/`.

---

## Repository Documentation Index

Refer to the following documents for comprehensive enterprise specifications:

### 1. Architectural Blueprints
*   **[ARCHITECTURE.md](file:///c:/Users/lenovo/Desktop/mohmmed/ARCHITECTURE.md)**: High-level architectural patterns, hybrid Clean/Modular boundaries.
*   **[SYSTEM_DESIGN.md](file:///c:/Users/lenovo/Desktop/mohmmed/SYSTEM_DESIGN.md)**: Design specifications for all 22 Core Platform Modules.
*   **[SECURITY_ARCHITECTURE.md](file:///c:/Users/lenovo/Desktop/mohmmed/SECURITY_ARCHITECTURE.md)**: API Key AES-256-GCM encryption, Vault, rotation schemas, RBAC/ABAC structures.
*   **[AI_GATEWAY.md](file:///c:/Users/lenovo/Desktop/mohmmed/AI_GATEWAY.md)**: Model router, adapters, stream engine, caching, retries, failovers, token counting, and Diagnostics.
*   **[PLUGIN_ARCHITECTURE.md](file:///c:/Users/lenovo/Desktop/mohmmed/PLUGIN_ARCHITECTURE.md)**: Plugin manifests, loaders, lifecycle states, and sandboxing.
*   **[EVENT_SYSTEM.md](file:///c:/Users/lenovo/Desktop/mohmmed/EVENT_SYSTEM.md)**: Event Bus design, Pub/Sub schemas, Domain vs Background events.
*   **[DATABASE_DESIGN.md](file:///c:/Users/lenovo/Desktop/mohmmed/DATABASE_DESIGN.md)**: Schemas for PostgreSQL, Redis keyspace, Qdrant vectors, and Storage buckets.
*   **[DEPLOYMENT_ARCHITECTURE.md](file:///c:/Users/lenovo/Desktop/mohmmed/DEPLOYMENT_ARCHITECTURE.md)**: Multi-region topologies, connection pools, and containerized deployment paths.

### 2. Operational Blueprints
*   **[OBSERVABILITY.md](file:///c:/Users/lenovo/Desktop/mohmmed/OBSERVABILITY.md)**: OpenTelemetry metrics, Grafana dashboards, and Sentry configurations.
*   **[OPERATIONS_RUNBOOK.md](file:///c:/Users/lenovo/Desktop/mohmmed/OPERATIONS_RUNBOOK.md)**: Operational health checks, emergency failovers, key rotations, and triage.

### 3. Engineering Guidelines
*   **[PROJECT_STRUCTURE.md](file:///c:/Users/lenovo/Desktop/mohmmed/PROJECT_STRUCTURE.md)**: Directory maps, import constraints, and architectural boundaries.
*   **[CODING_STANDARDS.md](file:///c:/Users/lenovo/Desktop/mohmmed/CODING_STANDARDS.md)**: SOLID coding principles, TypeScript strict typing, error monads.
*   **[DESIGN_SYSTEM.md](file:///c:/Users/lenovo/Desktop/mohmmed/DESIGN_SYSTEM.md)**: HSL tokens, fonts, animations, and LTR/RTL Arabic localization mappings.
*   **[DEVELOPMENT_GUIDE.md](file:///c:/Users/lenovo/Desktop/mohmmed/DEVELOPMENT_GUIDE.md)**: Local developer setup, environment templates, Git branching.
*   **[CONTRIBUTING.md](file:///c:/Users/lenovo/Desktop/mohmmed/CONTRIBUTING.md)**: QA review checklist, testing guidelines, and **Enterprise Quality Gates**.
*   **[ROADMAP.md](file:///c:/Users/lenovo/Desktop/mohmmed/ROADMAP.md)**: Multi-phase timeline and detailed Risk Analysis.
*   **[CHANGELOG.md](file:///c:/Users/lenovo/Desktop/mohmmed/CHANGELOG.md)**: Repository release history.
\n## Latest Updates\nProject successfully initialized and uploaded.
