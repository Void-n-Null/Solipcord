import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
