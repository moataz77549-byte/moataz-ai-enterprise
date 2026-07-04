# Moataz AI — Project Structure Specification

This document maps the folder layout of Moataz AI. The directory structure is organized around **Clean Architecture** boundaries to guarantee maintainability and separation of concerns as the project grows.

---

## 1. Directory Blueprint

The workspace root is organized as follows:

```text
moataz-ai/
├── src/
│   ├── domain/               # Domain Layer (Strictly Independent Core)
│   │   ├── entities/         # Domain entities and value objects
│   │   ├── events/           # Domain event definitions
│   │   └── repositories/     # Database and storage repository interfaces
│   │
│   ├── application/          # Application Layer (Orchestration & Use Cases)
│   │   ├── use-cases/        # Commands, queries, and orchestration flows
│   │   └── ports/            # Interfaces for external systems (AI, Cache, Logs)
│   │
│   ├── infrastructure/       # Infrastructure Layer (Concrete Implementations)
│   │   ├── persistence/      # Supabase PostgreSQL repositories, Prisma/Drizzle setups
│   │   ├── external/         # AI provider integrations (OpenAI, Gemini adapters)
│   │   ├── security/         # Encryption, vaults, and token decrypters
│   │   └── cache/            # Redis adapters and caching configurations
│   │
│   ├── presentation/         # Presentation Layer (Web Application UI)
│   │   ├── components/       # Design system elements, buttons, inputs, modals
│   │   ├── hooks/            # UI-level React hooks (state controllers)
│   │   ├── styles/           # Global styles and tailwind additions
│   │   └── pages/            # Next.js App Router route components
│   │
│   └── shared/               # Shared Utilities (Dumb Helpers & Shared Types)
│       ├── types/            # Common global TypeScript declarations
│       ├── utils/            # Independent formatting and calculation functions
│       └── errors/           # Global error classes and monad definition helpers
│
├── public/                   # Static assets (images, fonts, vector designs)
├── tailwind.config.ts        # Tailwind Design System definitions
├── tsconfig.json             # Strict TypeScript configuration
├── postcss.config.js         # PostCSS configuration
├── .eslintrc.json            # ESLint rules and boundary settings
├── .prettierrc               # Formatting configurations
└── .gitignore                # Version control exclusions
```

---

## 2. Directory Responsibilities

### `src/domain`
*   *Purpose*: Houses the core business logic of the enterprise.
*   *Key Concepts*: Represents the rules of the business (e.g. "a prompt request must map to a valid workspace session").
*   *Forbidden*: No React hooks, no Next.js handlers, no fetch calls, no SQL statements, no third-party APIs.

### `src/application`
*   *Purpose*: Manages application-specific flows. Orchestrates data from repository interfaces and feeds them to domain models.
*   *Key Concepts*: Defines the contract interfaces (ports) for AI providers, caching, logging, and databases.
*   *Forbidden*: No DB connection strings, no exact provider credentials.

### `src/infrastructure`
*   *Purpose*: Handles data persistence and communications with third-party servers.
*   *Key Concepts*: Encapsulates DB drivers, Redis clients, Qdrant vectors, and concrete HTTP connectors for OpenAI/Gemini/Claude.
*   *Forbidden*: No direct UI rendering code.

### `src/presentation`
*   *Purpose*: Visual interface layer. Captures user input, handles routing, and renders HTML/CSS.
*   *Key Concepts*: UI components, local forms, framer animations, and design system overrides.
*   *Forbidden*: Business logic, database queries, and direct encryption secrets operations are strictly prohibited here.

---

## 3. Strict Dependency Isolation (Import Boundaries)

To prevent boundary contamination, the project enforces compiler-level constraints configured in `.eslintrc.json`:

```text
                                [ DEPENDENCY FLOW ]
┌──────────────────┐      ┌───────────────────┐      ┌───────────────┐
│  Presentation   │ ───> │    Application    │ ───> │    Domain     │
└──────────────────┘      └───────────────────┘      └───────────────┘
         │                          ▲                        ▲
         │                          │                        │
         ▼                          │                        │
┌────────────────────────────────────────────────────────────┐
│                       Infrastructure                       │
└────────────────────────────────────────────────────────────┘
```

1.  **Domain Layer** has zero dependencies. It cannot import anything from Application, Presentation, or Infrastructure.
2.  **Application Layer** can only import from Domain and Shared. It is prohibited from importing Presentation or Infrastructure.
3.  **Infrastructure Layer** can import from Application (ports) and Domain (entities) to implement interfaces, but is prohibited from importing Presentation.
4.  **Presentation Layer** can import from Application, Domain, and Shared to execute commands, but cannot directly run DB transactions or concrete infrastructure services.
5.  **Shared Layer** can only import standard libraries. It cannot import any of the architecture layers.
