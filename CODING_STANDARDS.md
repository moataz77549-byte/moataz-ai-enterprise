# Coding Standards & Engineering Guidelines

This manual defines the technical requirements and coding conventions for all developers working on Moataz AI. Our objective is to keep the codebase clean, legible, and maintainable as it scales beyond 500,000 lines of code.

---

## 1. Clean Architecture & Modular Isolation

All codebase additions must follow these guidelines:
1.  **Strict Layer Isolation**:
    *   *Domain*: Must have 0 external library imports (pure typescript). No imports from sibling directories.
    *   *Application*: Imports only Domain and Shared. Direct references to database queries or API SDKs are prohibited.
    *   *Infrastructure*: Implements ports defined in Application. All direct SQL, Redis commands, and fetch operations must reside here.
    *   *Presentation*: React components and hooks. Strictly no direct database transactions or raw cryptographical operations.
2.  **Modular Isolation Boundaries**:
    *   A feature module must never import concrete infrastructure or presentation details from a sibling module.
    *   Cross-module communications must occur via abstract port interfaces or asynchronously through the Event Bus.

---

## 2. TypeScript Compilation & Strict Rules

Moataz AI enforces Strict-Mode TypeScript. The `tsconfig.json` compiler configurations must include:
*   `strict: true` — Enables all strict type-checking options.
*   `noImplicitAny: true` — Throws an error on expressions and declarations with an implied `any` type.
*   `strictNullChecks: true` — Ensures variables are checked for null or undefined before performing operations.
*   `noUnusedLocals: true` & `noUnusedParameters: true` — Prevents dead variable code from accumulating.
*   `exactOptionalPropertyTypes: true` — Prevents setting optional keys to explicit `undefined` values.

---

## 3. Strict Error Handling (Result Monad)

We do not use generic `try/catch` blocks for recoverable application errors. Instead, we use a monadic `Result<Value, Error>` type to make error returns explicit in function type signatures.

```typescript
// Type definition for safe error handling
export type Result<T, E = Error> = 
  | { success: true; value: T } 
  | { success: false; error: E };

export class ApplicationError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'ApplicationError';
  }
}

// Explicit execution signature
export function parseToken(token: string | null): Result<string, ApplicationError> {
  if (!token) {
    return { 
      success: false, 
      error: new ApplicationError('TOKEN_MISSING', 'The authorization token is missing.') 
    };
  }
  
  if (token.length < 10) {
    return { 
      success: false, 
      error: new ApplicationError('TOKEN_INVALID', 'The token format is invalid.') 
    };
  }

  return { success: true, value: token };
}
```

---

## 4. Naming Conventions

Consistency in naming keeps codebases highly navigable:

| Target | Convention | Example |
| :--- | :--- | :--- |
| **Directories** | `kebab-case` | `src/modules/ai-gateway` |
| **Files (Non-UI)** | `kebab-case` | `model-router.service.ts` |
| **Files (UI Components)** | `kebab-case` | `custom-button.tsx` |
| **Classes** | `PascalCase` | `WorkspaceRepository` |
| **Interfaces** | `PascalCase` | `IAIGateway` (Prefix `I` allowed exclusively on port abstractions) |
| **Types** | `PascalCase` | `UserPreferences` |
| **Variables & Functions** | `camelCase` | `decryptedApiKey` |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_MAX_TOKENS` |
| **React Hooks** | `camelCase` (must start with `use`) | `useActiveSession` |

---

## 5. Technical Debt Prevention Strategy

Technical debt accumulates if left unchecked. Moataz AI establishes these gates:
*   **Linter Gate**: No warnings allowed in main/develop branch deployments. Pre-commit hooks automatically block files containing console.logs or formatting violations.
*   **Refactoring Triggers**: Any file exceeding 300 lines of code must be reviewed for split-responsibility. Any function with a cyclomatic complexity score greater than 8 must be refactored.
*   **No TODO or FIXME**: No code containing `// TODO` or `// FIXME` comments is permitted in the codebase. All future enhancements must be cataloged in the roadmap or logged in issue trackers.
