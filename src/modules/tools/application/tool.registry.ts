import { ToolDefinition } from '../../ai-gateway/domain/adapter.interface';
import { ApplicationError } from '@shared/errors';

export interface ToolExecutor {
  manifest: ToolDefinition;
  execute: (args: Record<string, any>) => Promise<any>;
}

class ToolRegistry {
  private tools: Map<string, ToolExecutor> = new Map();

  /**
   * Registers a new tool capability in the gateway registry.
   */
  public register(executor: ToolExecutor): void {
    const name = executor.manifest.name;
    if (this.tools.has(name)) {
      throw new ApplicationError('TOOL_REGISTRY_ERROR', `Tool with name ${name} is already registered.`);
    }
    this.tools.set(name, executor);
  }

  /**
   * Retrieves a tool by name.
   */
  public get(name: string): ToolExecutor | undefined {
    return this.tools.get(name);
  }

  /**
   * Lists all registered tool manifests.
   */
  public listManifests(): ToolDefinition[] {
    return Array.from(this.tools.values()).map((t) => t.manifest);
  }

  /**
   * Validates tool input parameters against the manifest's JSON-schema-style
   * definition. Previously this only checked that required keys were present -
   * it never checked types, so a tool declaring `count: number` would happily
   * execute with `count: "banana"`. Now each property's declared `type` is
   * checked against the value actually supplied.
   */
  public validateArgs(name: string, args: Record<string, unknown>): boolean {
    const tool = this.get(name);
    if (!tool) return false;

    const schema = tool.manifest.parameters as {
      required?: string[];
      properties?: Record<string, { type?: string }>;
    };

    const required = schema.required || [];
    for (const req of required) {
      if (args[req] === undefined || args[req] === null) {
        return false;
      }
    }

    const properties = schema.properties || {};
    for (const [key, value] of Object.entries(args)) {
      const propSchema = properties[key];
      if (!propSchema?.type || value === undefined) continue;
      if (!this.matchesType(value, propSchema.type)) {
        return false;
      }
    }

    return true;
  }

  private matchesType(value: unknown, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
      case 'integer':
        return typeof value === 'number' && !Number.isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        // Unknown/unspecified schema type: don't block execution over a schema gap.
        return true;
    }
  }
}

export const ToolsRegistry = new ToolRegistry();
export type { ToolRegistry };
