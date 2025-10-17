import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Message formatting utilities
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
      minute: '2-digit',
      hour12: true
    });
  } else {
    // Show date and time for older messages (e.g., "10/16/25, 1:22 AM")
    return messageDate.toLocaleString([], {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
}

export function formatMessageTimeOnly(date: Date): string {
  const messageDate = new Date(date);
  
  // Always show time only with AM/PM
  return messageDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
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
 * AI Generation utilities
 * Thin wrapper around OpenRouter client for common use cases
 */
export const aiUtils = {
  /**
   * Generate text from messages
   * Uses OpenRouter client which handles logging, retries, and errors internally
   * 
   * @param params Configuration object
   * @param params.system - Optional system prompt to define AI behavior
   * @param params.messages - Array of messages (user, assistant, etc.)
   * @param params.temperature - Controls randomness (0.0-1.0), default 0.7
   * @param params.model - AI model to use, defaults to Gemini 2.5 Flash
   * @returns Generated text response
   */
  generateText: async (params: {
    system?: string;
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    temperature?: number;
    model?: string;
  }): Promise<string> => {
    try {
      const { openRouterClient } = await import('./openrouter-client');

      // Use generateTextWithSystem if system prompt is provided
      if (params.system) {
        const result = await openRouterClient.generateTextWithSystem({
          system: params.system,
          messages: params.messages,
          temperature: params.temperature,
          model: params.model,
        });
        return result.text;
      }

      // Otherwise use generateText directly
      const result = await openRouterClient.generateText({
        messages: params.messages,
        temperature: params.temperature,
        model: params.model,
      });
      return result.text;
    } catch (error) {
      console.error('❌ [AI] Error generating text:', error);
      // Return a generic fallback on error
      return 'Sorry, I couldn\'t generate a response right now.';
    }
  },

  /**
   * Generate a group chat response for a persona
   * Convenience method for group chat scenarios
   * 
   * @param params Configuration for generating a group chat response
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

    return aiUtils.generateText({
      system: systemPrompt,
      messages: [{ role: 'user', content: params.message }],
      temperature: 0.8, // Slightly higher for more natural conversation
    });
  },
};
