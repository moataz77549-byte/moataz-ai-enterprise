import { NextRequest } from 'next/server';
import { BaseController } from '@core/backend/base-controller';
import { Gateway } from '@modules/ai-gateway/application/gateway.service';
import { z } from 'zod';

const chatRequestSchema = z.object({
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant', 'tool']),
      content: z.string(),
    })
  ),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  jsonMode: z.boolean().optional(),
  stream: z.boolean().optional(),
  routingStrategy: z.enum(['manual', 'cost', 'latency', 'quality', 'task']).optional(),
  taskType: z.enum(['chat', 'code', 'reasoning', 'vision', 'extraction']).optional(),
});

import { ensureBootstrapped } from '../../bootstrap';

export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();
    const parseResult = await BaseController.parseBody(request, chatRequestSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const payload = parseResult.data;

    // Check for streaming vs. standard request
    if (payload.stream) {
      const stream = await Gateway.stream(
        {
          model: payload.model,
          messages: payload.messages,
          temperature: payload.temperature,
          maxTokens: payload.maxTokens,
          jsonMode: payload.jsonMode,
        },
        {
          strategy: payload.routingStrategy || 'manual',
          task: payload.taskType,
        }
      );

      // Return a Server-Sent Events stream
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    const response = await Gateway.chat(
      {
        model: payload.model,
        messages: payload.messages,
        temperature: payload.temperature,
        maxTokens: payload.maxTokens,
        jsonMode: payload.jsonMode,
      },
      {
        strategy: payload.routingStrategy || 'manual',
        task: payload.taskType,
      }
    );

    return BaseController.success(response);
  } catch (error) {
    return BaseController.handleError(error);
  }
}
