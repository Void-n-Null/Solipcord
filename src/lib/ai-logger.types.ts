import { AIMessage } from "@/services/prompt-constructor";

export interface AIRequestLog {
  timestamp: string;
  model: string;
  temperature: number;
  response: string;
  duration: number;
  messages: AIMessage[];
  status: 'success' | 'error';
  error?: string;
  // Raw HTTP request body sent to the provider (OpenRouter)
  requestBody?: Record<string, unknown>;
  // Response metadata from the AI SDK
  responseMetadata?: {
    finishReason?: string;
    usage?: {
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
    };
    warnings?: unknown[];
  };
}
