/**
 * Custom OpenRouter Client with Integrated Logging
 * Direct REST API implementation for better control over AI requests
 * Handles all request construction, execution, and logging internally
 */

import type { AIRequestLog } from './ai-logger.types';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterChatCompletionRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
  // OpenRouter specific
  transforms?: string[];
  extra_headers?: Record<string, string>;
}

export interface OpenRouterUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenRouterChoice {
  index: number;
  message: OpenRouterMessage;
  finish_reason: 'stop' | 'length' | 'content_filter' | null;
}

export interface OpenRouterChatCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage: OpenRouterUsage;
}

export interface OpenRouterError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing?: {
    prompt: string;
    completion: string;
  };
  context_length?: number;
  architecture?: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export class OpenRouterClient {
  private apiKey: string;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private maxRetries: number;
  private retryDelay: number;
  private enableLogging: boolean;

  constructor(apiKey?: string, options?: {
    maxRetries?: number;
    retryDelay?: number;
    enableLogging?: boolean;
  }) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.maxRetries = options?.maxRetries ?? 3;
    this.retryDelay = options?.retryDelay ?? 1000;
    this.enableLogging = options?.enableLogging ?? true;
    
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    this.defaultHeaders = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Neural Social Network',
    };
  }

  /**
   * Log AI request (only on server-side)
   */
  private async logRequest(log: AIRequestLog): Promise<void> {
    if (!this.enableLogging) return;
    
    try {
      // Only log on server-side (check for Node.js environment)
      if (typeof window === 'undefined') {
        const { logAIRequest } = await import('./ai-logger');
        await logAIRequest(log);
      }
    } catch (error) {
      // Silently fail logging to not break the app
      console.error('[OpenRouter] Logging failed:', error);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Retry on network errors, timeouts, and 5xx server errors
    if (error.message?.includes('fetch')) return true;
    if (error.message?.includes('timeout')) return true;
    if (error.message?.includes('HTTP 5')) return true;
    if (error.message?.includes('HTTP 429')) return true; // Rate limit
    return false;
  }

  /**
   * Make a request to OpenRouter API with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.defaultHeaders,
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorData: OpenRouterError = await response.json().catch(() => ({
            error: {
              message: `HTTP ${response.status}: ${response.statusText}`,
              type: 'http_error',
            },
          }));
          
          const error = new Error(errorData.error.message);
          
          // Don't retry on client errors (4xx) except 429 (rate limit)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw error;
          }
          
          lastError = error;
          
          // If this is the last attempt, throw the error
          if (attempt === this.maxRetries) {
            throw error;
          }
          
          // Wait before retrying (exponential backoff)
          const delay = this.retryDelay * Math.pow(2, attempt);
          await this.sleep(delay);
          continue;
        }

        return response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is the last attempt or error is not retryable, throw
        if (attempt === this.maxRetries || !this.isRetryableError(lastError)) {
          throw lastError;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = this.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Get available models
   */
  async getModels(): Promise<OpenRouterModelsResponse> {
    return this.makeRequest<OpenRouterModelsResponse>('/models');
  }

  /**
   * Create a chat completion
   */
  async createChatCompletion(
    request: OpenRouterChatCompletionRequest
  ): Promise<OpenRouterChatCompletionResponse> {
    return this.makeRequest<OpenRouterChatCompletionResponse>(
      '/chat/completions',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  /**
   * Generate text with integrated logging
   * Main interface for text generation - handles everything internally
   */
  async generateText(params: {
    messages: OpenRouterMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    text: string;
    usage: OpenRouterUsage;
    finishReason: string | null;
    model: string;
  }> {
    const startTime = Date.now();
    const {
      messages,
      model = 'anthropic/claude-haiku-4.5',
      temperature = 0.7,
      maxTokens = 1000,
    } = params;

    // Create request body for logging
    const requestBody = {
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    let response: OpenRouterChatCompletionResponse | null = null;
    let errorMessage: string | undefined;

    try {
      response = await this.createChatCompletion(requestBody);

      const choice = response.choices[0];
      if (!choice) {
        throw new Error('No response generated');
      }

      const duration = Date.now() - startTime;

      // Log successful request
      await this.logRequest({
        timestamp: new Date().toISOString(),
        model: response.model,
        temperature,
        response: choice.message.content,
        duration,
        messages,
        status: 'success',
        requestBody,
        responseMetadata: {
          finishReason: choice.finish_reason || undefined,
          usage: {
            inputTokens: response.usage.prompt_tokens,
            outputTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          },
          warnings: [],
        },
      });

      return {
        text: choice.message.content,
        usage: response.usage,
        finishReason: choice.finish_reason,
        model: response.model,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      errorMessage = error instanceof Error ? error.message : String(error);

      // Log failed request
      await this.logRequest({
        timestamp: new Date().toISOString(),
        model,
        temperature,
        response: '',
        duration,
        messages,
        status: 'error',
        error: errorMessage,
        requestBody,
        responseMetadata: response ? {
          finishReason: undefined,
          usage: {
            inputTokens: response.usage?.prompt_tokens,
            outputTokens: response.usage?.completion_tokens,
            totalTokens: response.usage?.total_tokens,
          },
          warnings: [],
        } : undefined,
      });

      console.error('❌ [OpenRouter] Error generating text:', error);
      throw error; // Re-throw to let caller handle
    }
  }

  /**
   * Generate text with system prompt
   * Convenience method that prepends a system message
   */
  async generateTextWithSystem(params: {
    system: string;
    messages: OpenRouterMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{
    text: string;
    usage: OpenRouterUsage;
    finishReason: string | null;
    model: string;
  }> {
    // Prepend system message to the messages array
    const messagesWithSystem: OpenRouterMessage[] = [
      { role: 'system', content: params.system },
      ...params.messages,
    ];

    // Use generateText which already handles logging
    return this.generateText({
      messages: messagesWithSystem,
      model: params.model,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
    });
  }

  /**
   * Stream chat completion (for future use)
   */
  async *createChatCompletionStream(
    request: OpenRouterChatCompletionRequest
  ): AsyncGenerator<string, void, unknown> {
    const streamRequest = { ...request, stream: true };
    
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(streamRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Get model information by ID
   */
  async getModel(modelId: string): Promise<OpenRouterModel | null> {
    try {
      const models = await this.getModels();
      return models.data.find(model => model.id === modelId) || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if a model is available
   */
  async isModelAvailable(modelId: string): Promise<boolean> {
    const model = await this.getModel(modelId);
    return model !== null;
  }

  /**
   * Get pricing information for a model
   */
  async getModelPricing(modelId: string): Promise<{
    prompt: string;
    completion: string;
  } | null> {
    const model = await this.getModel(modelId);
    return model?.pricing || null;
  }

  /**
   * Estimate cost for a request
   */
  async estimateCost(
    modelId: string,
    promptTokens: number,
    completionTokens: number
  ): Promise<number | null> {
    const pricing = await this.getModelPricing(modelId);
    if (!pricing) return null;

    // Parse pricing strings (e.g., "$0.0005" -> 0.0005)
    const promptCost = parseFloat(pricing.prompt.replace(/[^0-9.]/g, ''));
    const completionCost = parseFloat(pricing.completion.replace(/[^0-9.]/g, ''));

    return (promptTokens * promptCost) + (completionTokens * completionCost);
  }
}

// Create singleton instance
export const openRouterClient = new OpenRouterClient();
