/**
 * Ambient type declarations for @anthropic-ai/sdk.
 * These are used when the SDK is not installed (dev/CI).
 * At runtime, the actual SDK types take precedence.
 */
declare module '@anthropic-ai/sdk' {
  interface TextBlock {
    type: 'text';
    text: string;
  }

  interface ContentBlock {
    type: string;
    text?: string;
  }

  interface Usage {
    input_tokens: number;
    output_tokens: number;
  }

  interface MessageResponse {
    content: ContentBlock[];
    usage: Usage;
  }

  interface MessageCreateParams {
    model: string;
    max_tokens: number;
    system?: string;
    messages: Array<{ role: string; content: string }>;
    temperature?: number;
  }

  interface Messages {
    create(params: MessageCreateParams): Promise<MessageResponse>;
  }

  class Anthropic {
    constructor(options: { apiKey: string });
    messages: Messages;
  }

  namespace Anthropic {
    type TextBlock = import('@anthropic-ai/sdk').TextBlock;
  }

  export default Anthropic;
}
