import { getModelMetadata, getAllModels } from '../../providers/domain/model.registry';
import { ApplicationError } from '@shared/errors';

export type RoutingStrategy = 'manual' | 'cost' | 'latency' | 'quality' | 'task';

export interface RouteOptions {
  strategy: RoutingStrategy;
  task?: 'chat' | 'code' | 'reasoning' | 'vision' | 'extraction';
  minContextWindow?: number;
}

class ModelRouter {
  /**
   * Resolves the optimal model ID based on strategy and options.
   */
  public resolveModel(modelId: string, options: RouteOptions): string {
    const models = getAllModels();

    switch (options.strategy) {
      case 'manual': {
        const metadata = getModelMetadata(modelId);
        if (!metadata) {
          throw new ApplicationError('ROUTING_ERROR', `Requested model ${modelId} is not registered.`);
        }
        return modelId;
      }

      case 'cost': {
        // Find cheapest model meeting context window requirements
        const minContext = options.minContextWindow || 0;
        const eligible = models.filter((m) => m.contextWindow >= minContext);
        if (eligible.length === 0) {
          throw new ApplicationError('ROUTING_ERROR', 'No models match context window requirement.');
        }
        // Sort by input + output price
        eligible.sort((a, b) => (a.inputPricePerMillion + a.outputPricePerMillion) - (b.inputPricePerMillion + b.outputPricePerMillion));
        return eligible[0].id;
      }

      case 'quality': {
        // Prefer reasoning, tool, and vision models
        const minContext = options.minContextWindow || 0;
        const eligible = models.filter((m) => m.contextWindow >= minContext);
        if (eligible.length === 0) {
          throw new ApplicationError('ROUTING_ERROR', 'No models match quality constraints.');
        }
        eligible.sort((a, b) => {
          const scoreA = (a.reasoning ? 3 : 0) + (a.tools ? 2 : 0) + (a.vision ? 1 : 0);
          const scoreB = (b.reasoning ? 3 : 0) + (b.tools ? 2 : 0) + (b.vision ? 1 : 0);
          return scoreB - scoreA; // descending quality score
        });
        return eligible[0].id;
      }

      case 'latency': {
        // Fallback to fastest lightweight models
        const fastModels = ['gpt-4o-mini', 'gemini-1.5-flash', 'claude-3-5-haiku', 'deepseek-chat'];
        const minContext = options.minContextWindow || 0;
        const eligible = models.filter((m) => m.contextWindow >= minContext && fastModels.includes(m.id));
        if (eligible.length > 0) {
          return eligible[0].id;
        }
        return 'gpt-4o-mini';
      }

      case 'task': {
        if (!options.task) {
          throw new ApplicationError('ROUTING_ERROR', 'Task option must be specified for task strategy.');
        }
        return this.resolveByTask(options.task);
      }

      default:
        return modelId;
    }
  }

  private resolveByTask(task: 'chat' | 'code' | 'reasoning' | 'vision' | 'extraction'): string {
    switch (task) {
      case 'code':
        return 'claude-3-5-sonnet';
      case 'reasoning':
        return 'deepseek-reasoner';
      case 'vision':
        return 'gpt-4o';
      case 'extraction':
        return 'gemini-1.5-flash';
      case 'chat':
      default:
        return 'gpt-4o-mini';
    }
  }
}

export const Router = new ModelRouter();
