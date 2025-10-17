import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AIRequestLog } from "./ai-logger.types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Message formatting utility
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  
  // Check if same day (compare dates, not timestamps)
  const sameDay = 
    now.getDate() === messageDate.getDate() &&
    now.getMonth() === messageDate.getMonth() &&
    now.getFullYear() === messageDate.getFullYear();
  
  if (sameDay) {
    // Show time only for today's messages
    return messageDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else {
    // Show date and time for older messages (e.g., "10/16/25, 1:22 AM")
    return messageDate.toLocaleString([], {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Neural network utility functions
export const neuralUtils = {
  // Activation functions
  sigmoid: (x: number): number => {
    return 1 / (1 + Math.exp(-x));
  },
  
  relu: (x: number): number => {
    return Math.max(0, x);
  },
  
  tanh: (x: number): number => {
    return Math.tanh(x);
  },
  
  // Loss functions
  meanSquaredError: (predictions: number[], targets: number[]): number => {
    if (predictions.length !== targets.length) return 0;
    
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      const error = predictions[i] - targets[i];
      sum += error * error;
    }
    
    return sum / predictions.length;
  },
  
  // Derivative functions for backpropagation
  sigmoidDerivative: (x: number): number => {
    const sig = neuralUtils.sigmoid(x);
    return sig * (1 - sig);
  },
  
  reluDerivative: (x: number): number => {
    return x > 0 ? 1 : 0;
  },
  
  tanhDerivative: (x: number): number => {
    const tanh = Math.tanh(x);
    return 1 - tanh * tanh;
  },
};

/**
 * AI Generation utilities using OpenRouter
 * Generates text using Google Gemini 2.5 Flash via OpenRouter
 */
export const aiUtils = {
  /**
   * Generate text from a system and user prompt
   * Uses OpenRouter's Google Gemini 2.5 Flash model via AI SDK
   * 
   * @param params Configuration object
   * @param params.system - System prompt to define AI behavior
   * @param params.prompt - User prompt for the request
   * @param params.temperature - Controls randomness (0.0-1.0), default 0.7
   * @param params.prefill - Optional initial assistant response text. When provided, 
   *                         the model will continue from this prefilled content as the 
   *                         starting point for the response, useful for constraining output format.
   * @returns Generated text response
   */
  generateText: async (params: {
    system: string;
    prompt: string;
    temperature?: number;
    prefill?: string;
  }): Promise<string> => {
    const startTime = Date.now();
    const temperature = params.temperature ?? 0.7;
    const model = 'google/gemini-2.5-flash-preview-09-2025';
    let response = '';
    let requestBody: Record<string, unknown> | undefined;
    let responseMetadata: AIRequestLog['responseMetadata'] | undefined;

    try {
      const { generateText } = await import('ai');
      const { createOpenRouter } = await import('@openrouter/ai-sdk-provider');

      // Create OpenRouter provider instance
      const openRouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
      });

      const modelInstance = openRouter.languageModel(model);

      // Build messages array with optional prefill
      // The prefill parameter allows you to provide an initial assistant response
      // that the model will continue from, useful for guiding output format
      const messages: { role: 'user' | 'assistant'; content: string }[] = [
        { role: 'user', content: params.prompt },
      ];
      
      // If prefill is provided, add an initial assistant message
      // This primes the model to continue from that point rather than starting fresh
      if (params.prefill) {
        messages.unshift({ 
          role: 'assistant', 
          content: params.prefill 
        });
      }

      const result = await generateText({
        model: modelInstance,
        system: params.system,
        messages: messages,
        temperature: temperature,
      });

      response = result.text;

      // Capture the raw HTTP request body sent to OpenRouter
      // The AI SDK exposes this via result.request.body
      if (result.request && 'body' in result.request) {
        try {
          // Parse the body if it's a string, otherwise use it directly
          const body = typeof result.request.body === 'string' 
            ? JSON.parse(result.request.body) 
            : result.request.body;
          requestBody = body as Record<string, unknown>;
        } catch {
          requestBody = { raw: String(result.request.body) };
        }
      }

      // Capture response metadata
      responseMetadata = {
        finishReason: result.finishReason,
        usage: result.usage,
        warnings: result.warnings,
      };

      const duration = Date.now() - startTime;

      // Log successful request with full details
      const { logAIRequest } = await import('./ai-logger');
      await (logAIRequest as (log: AIRequestLog) => Promise<void>)({
        timestamp: new Date().toISOString(),
        model,
        system: params.system,
        prompt: params.prompt,
        temperature,
        response,
        duration,
        status: 'success',
        requestBody,
        responseMetadata,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Log failed request
      try {
        const { logAIRequest } = await import('./ai-logger');
        await (logAIRequest as (log: AIRequestLog) => Promise<void>)({
          timestamp: new Date().toISOString(),
          model,
          system: params.system,
          prompt: params.prompt,
          temperature,
          response: '',
          duration,
          status: 'error',
          error: errorMessage,
          requestBody,
          responseMetadata,
        });
      } catch {
        // Silently fail logging if it errors
      }

      console.error('❌ [AI] Error generating text:', error);
      // Return a generic fallback
      return 'Sorry, I couldn\'t generate a response right now.';
    }
  },

  /**
   * Generate a group chat response for a persona
   * Constructs appropriate prompts and uses the AI SDK properly
   * 
   * @param params Configuration for generating a group chat response
   * @param params.personaName - Name of the persona responding
   * @param params.personaDescription - Optional description of the persona
   * @param params.message - The message to respond to
   * @param params.groupName - Name of the group chat
   * @param params.otherParticipants - Array of other participant names
   * @returns Generated response text
   */
  generateGroupChatResponse: async (params: {
    personaName: string;
    personaDescription?: string;
    message: string;
    groupName: string;
    otherParticipants: string[];
  }): Promise<string> => {
    const systemPrompt = `You are ${params.personaName}${params.personaDescription ? ` - ${params.personaDescription}` : ''} participating in a group chat called "${params.groupName}" with ${params.otherParticipants.join(', ')}.

Respond naturally as this character would. Keep your response concise and conversational. Match the tone and personality of the character.`;

    const userPrompt = params.message;

    // Use generateText with appropriate settings for group chat
    return aiUtils.generateText({
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.8, // Slightly higher for more natural conversation
    });
  },
};
