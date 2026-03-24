/**
 * Ambient type declarations for openai SDK.
 * These are used when the SDK is not installed (dev/CI).
 */
declare module 'openai' {
  namespace Chat {
    namespace Completions {
      interface ChatCompletionMessageParam {
        role: 'system' | 'user' | 'assistant';
        content: string;
      }

      interface ChatCompletionChoice {
        message: {
          content: string | null;
        };
      }

      interface ChatCompletionUsage {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
      }

      interface ChatCompletion {
        choices: ChatCompletionChoice[];
        usage: ChatCompletionUsage | null;
      }
    }
  }

  interface ChatCompletionsCreateParams {
    model: string;
    messages: Chat.Completions.ChatCompletionMessageParam[];
    max_tokens?: number;
    temperature?: number;
  }

  interface ChatCompletions {
    create(params: ChatCompletionsCreateParams): Promise<Chat.Completions.ChatCompletion>;
  }

  interface ChatResource {
    completions: ChatCompletions;
  }

  interface ImageData {
    url?: string;
  }

  interface ImagesResponse {
    data: ImageData[];
  }

  interface ImageGenerateParams {
    model: string;
    prompt: string;
    n: number;
    size: string;
  }

  interface Images {
    generate(params: ImageGenerateParams): Promise<ImagesResponse>;
  }

  class OpenAI {
    constructor(options: { apiKey: string });
    chat: ChatResource;
    images: Images;
  }

  export default OpenAI;
}
