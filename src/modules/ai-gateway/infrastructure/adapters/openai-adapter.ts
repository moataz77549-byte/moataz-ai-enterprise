import { OpenAICompatibleAdapter } from './generic-openai-adapter';

export class OpenAIAdapter extends OpenAICompatibleAdapter {
  constructor() {
    super(
      'openai',
      'OpenAI',
      'https://api.openai.com/v1',
      {
        supportsStreaming: true,
        supportsVision: true,
        supportsTools: true,
        supportsReasoning: true,
      }
    );
  }
}
