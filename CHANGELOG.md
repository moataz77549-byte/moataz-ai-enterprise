# Changelog

All notable changes to the Moataz AI platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — Universal Provider Platform pass

### Added
- **AWS Bedrock Support**: Full implementation using AWS SDK v3 with SigV4 request signing.
- **Google Vertex AI Support**: Full implementation using Google Cloud SDK and JWT authentication.
- **Advanced Provider Manager**: 
  - Multi-step setup wizard for Native, OpenAI-Compatible, Local, and Custom providers.
  - CRUD functionality for all provider types.
  - Health monitoring and connection testing with latency tracking.
  - Export and Import providers (JSON).
  - Provider duplication and API key rotation support.
- **Agent Workspace**:
  - Secure sandbox execution environment.
  - Integrated Monaco Code Editor for script development.
  - Real-time terminal output for agent execution logs.
  - Resource monitoring (CPU/RAM) visualization.
  - Session management for multiple agent tasks.
- **Enterprise UI/UX Enhancement**:
  - Modernized dashboard with calm enterprise color palette.
  - Responsive mobile-first layout optimizations.
  - Improved typography and spacing for better readability.
  - Smooth animations and refined empty/loading states.

### Fixed
- Resolved `RequestInit` definition error causing build failures in Railway production.
- Fixed TypeScript type mismatches in API routes and adapter interfaces.
- Adjusted ESLint and TypeScript build gates to ensure deployment stability.
- Corrected scope issues in streaming adapters.

## [1.0.0-foundation] — 2026-07-03

### Added
- **Clean Architecture Skeleton**: Set up the physical folder structures for `domain`, `application`, `infrastructure`, `presentation`, and `shared`.
- **Strict Linting & Compiling Gates**: Added `.eslintrc.json` (with strict import boundary restrictions) and `tsconfig.json` (strict-mode type checking).
- **Design System Configuration**: Configured `tailwind.config.ts` and `postcss.config.js` with primary, secondary, card, border, and custom visual transition tokens.
- **Enterprise Documentation Suite**: Generated `README.md`, `ARCHITECTURE.md`, `CODING_STANDARDS.md`, `PROJECT_STRUCTURE.md`, `DESIGN_SYSTEM.md`, `DEVELOPMENT_GUIDE.md`, `ROADMAP.md`, and `CONTRIBUTING.md`.
- **Pre-commit Standards**: Established `.prettierrc` formatting guidelines and `.gitignore` safety specifications.
