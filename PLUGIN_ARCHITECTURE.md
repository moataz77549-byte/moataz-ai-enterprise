# Plugin Architecture Blueprint

This document details the architecture of the Moataz AI Plugin system, which enables developers to extend the capabilities of the SaaS platform without modifying core codebases.

---

## 1. Plugin Manifest Schema

Every plugin must package a `manifest.json` file in its root directory. This manifest declares identifiers, entry points, and required system scopes.

```json
{
  "id": "github-connector-plugin",
  "name": "GitHub Repository Sync",
  "version": "1.0.4",
  "description": "Enables agents to read code repositories and track issue pipelines.",
  "entryPoint": "dist/index.js",
  "permissions": [
    "network:github.com",
    "workspace:read",
    "sandbox:allow-exec"
  ],
  "dependencies": {
    "core-api": "^1.0.0"
  }
}
```

### Permission Scopes
*   `network:<domain>`: Restricts outgoing HTTP calls exclusively to the specified host.
*   `workspace:read` / `workspace:write`: Allows access to workspace document scopes.
*   `sandbox:allow-exec`: Authorizes execution of inline scripts inside the sandbox container.

---

## 2. Plugin Lifecycle State Machine

Plugins progress through a structured set of lifecycle states managed by the Plugin Registry:

```mermaid
stateDiagram-Obj
    [*] --> Uninstalled
    Uninstalled --> Registered : Install Action
    Registered --> Initializing : Loader Load
    Initializing --> Active : Initialization Success
    Initializing --> Error : Validation Failed
    Active --> Suspended : Admin Action / Violation
    Suspended --> Active : Admin Resume
    Active --> Error : Runtime Crash
    Active --> Uninstalled : Uninstall Action
    Error --> Uninstalled : Uninstall Action
```

*   **Registered**: Manifest parsed and verified. Entry code validated against file limits.
*   **Initializing**: Entry scripts executed. Permissions requested and bound to the sandbox handler.
*   **Active**: Plugin hook listeners registered to the event bus. Fully ready to execute actions.
*   **Suspended**: Key system metrics (e.g., memory usage > 128MB) or permissions violations automatically freeze plugin executions.

---

## 3. Sandboxed Execution (Plugin Loader)

Plugins pose a security risk. To prevent them from accessing database secrets, environment variables, or other tenants' data:
1.  **Isolation**: Plugins run in an isolated JavaScript runtime VM (using tools like `vm2` or lightweight WASM micro-containers).
2.  **API Injection**: The host passes a mocked, minimal global object containing only approved APIs (e.g. `console`, `fetch` wrapped in a proxy wrapper verifying network permissions, and event subscribers).
3.  **Strict Limits**: Resource quotas are enforced (max 100ms CPU execution per tick, max 64MB memory allocation).

```typescript
// Conceptual Isolation Loader (Infrastructure Layer)
import { NodeVM } from 'vm2';

export class PluginLoader {
  static load(pluginCode: string, allowedDomains: string[]): any {
    const vm = new NodeVM({
      console: 'inherit',
      sandbox: {},
      require: {
        external: false,
        root: './',
        mock: {
          // Wrap fetch to block access to unauthorized URLs
          'http-client': {
            fetch: async (url: string, options: any) => {
              const host = new URL(url).hostname;
              if (!allowedDomains.includes(host)) {
                throw new Error(`Security Exception: Access to host ${host} is blocked.`);
              }
              return fetch(url, options);
            }
          }
        }
      }
    });

    return vm.run(pluginCode, 'plugin.js');
  }
}
```
*Note: In the final production run, the Plugin Loader is executed inside stateless docker containers to prevent host process compromise.*
