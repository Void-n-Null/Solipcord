import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
