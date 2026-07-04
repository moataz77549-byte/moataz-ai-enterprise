# Moataz AI — Contribution Guidelines & Testing Strategy

This document describes the quality assurance practices, pull request workflows, and automated testing criteria for contributing to Moataz AI.

---

## 1. Quality Assurance Workflow

Every code change must pass through the integration pipeline before being merged into the `develop` or `main` branches.

### Pull Request Rules
1.  **Branch Check**: Feature branches must target `develop`. Release branches target `main`.
2.  **Lint & Compile**: Automated CI runs `npm run lint` and `npm run typecheck` on every commit. If either fails, the build breaks and the PR cannot be merged.
3.  **Peer Review**: At least two approvals from senior code reviewers are required.
4.  **No Exceptions**: Zero warning configurations, zero skipped tests, and zero bypasses of branch protection rules.

### Pull Request Description Template
When opening a PR, engineers must use this structured markdown layout:
```markdown
## Description
Brief summary of the changes and technical context.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Refactoring (internal layout restructuring)

## Quality Gate Checklist
- [ ] Code compiles without warnings (`npm run typecheck` passes).
- [ ] Lint audits pass successfully (`npm run lint` passes).
- [ ] Code follows the defined folder layouts in PROJECT_STRUCTURE.md.
- [ ] No hardcoded text strings (all strings mapped to design systems i18n).
- [ ] No placeholder functions, duplicate logic, or TODO blocks.
```

---

## 2. Comprehensive Testing Strategy

Moataz AI is a high-availability SaaS platform. We divide tests into five distinct boundaries:

### A. Unit Testing (Core Logic)
*   *Target*: Pure Domain entities, Value Objects, Shared helper utilities, and Application use cases.
*   *Framework*: Vitest or Jest.
*   *Standard*: Mock all external adapters. 100% logic path coverage.
*   *Command Plan*: `npm run test:unit`

### B. Integration Testing (Adapters & Ports)
*   *Target*: Verify communication between application use cases and concrete adapters (e.g. Supabase postgres schema triggers, Redis cache connection lifecycle, AI gateway network interfaces).
*   *Framework*: Vitest + Testcontainers (for spin-up database instances).
*   *Standard*: No real calls to AI providers; stub HTTP responses with exact payloads. Verify database writes and transaction rollbacks.
*   *Command Plan*: `npm run test:integration`

### C. End-to-End Testing (User Flows)
*   *Target*: Core user journeys (e.g., configuring API keys, switching languages, starting a chat session).
*   *Framework*: Playwright or Cypress.
*   *Standard*: Run tests in headless browsers (Chromium, Firefox, WebKit) on simulated viewport devices (Mobile, Desktop).
*   *Command Plan*: `npm run test:e2e`

### D. Performance Testing (SLA Targets)
*   *Target*: Route latency, payload limits, and memory usage.
*   *Framework*: k6 (load generation) + Lighthouse CI.
*   *Standard*: Core route response latency must remain under 200ms. Lighthouse metrics for Performance, SEO, Accessibility, and Best Practices must score 95+ (Best Practices 100).
*   *Command Plan*: `npm run test:perf`

### E. Security Testing (Security Audit)
*   *Target*: XSS vulnerability, CSRF validation, injection vectors, and library package vulnerability scans.
*   *Framework*: OWASP ZAP + Snyk (dependency vulnerability scanner) + npm audit.
*   *Standard*: Zero critical or high-level vulnerabilities allowed in production bundles.
*   *Command Plan*: `npm run test:security`
