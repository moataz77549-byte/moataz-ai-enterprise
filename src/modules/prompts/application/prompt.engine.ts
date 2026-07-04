import { ApplicationError } from '@shared/errors';

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  version: number;
}

class PromptEngine {
  private templates: Map<string, PromptTemplate> = new Map();

  constructor() {
    // Seed default systems prompts
    this.register({
      id: 'default-assistant',
      name: 'Default Assistant',
      template: 'You are an intelligent, helpful AI assistant. Answer the user prompt directly. User context: {context}',
      variables: ['context'],
      version: 1,
    });
    this.register({
      id: 'code-reviewer',
      name: 'Code Reviewer',
      template: 'You are an expert code reviewer. Review the following code for optimizations, security issues, and style matching: {code}',
      variables: ['code'],
      version: 1,
    });
  }

  /**
   * Registers a prompt template.
   */
  public register(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Resolves a template by ID.
   */
  public get(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Formats a prompt by substituting variables.
   */
  public format(id: string, values: Record<string, string>): string {
    const template = this.get(id);
    if (!template) {
      throw new ApplicationError('PROMPT_ENGINE_ERROR', `Template with ID ${id} not found.`);
    }

    // Validate variables
    for (const variable of template.variables) {
      if (values[variable] === undefined) {
        throw new ApplicationError('PROMPT_ENGINE_ERROR', `Missing required variable: ${variable}`);
      }
    }

    let result = template.template;
    for (const [key, value] of Object.entries(values)) {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value);
    }
    return result;
  }

  /**
   * Lists all available prompt templates.
   */
  public listTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const Prompts = new PromptEngine();
export type { PromptEngine };
