import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Vector2, Vector3 } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Vector utilities
export const vector2 = {
  add: (a: Vector2, b: Vector2): Vector2 => ({
    x: a.x + b.x,
    y: a.y + b.y,
  }),
  
  subtract: (a: Vector2, b: Vector2): Vector2 => ({
    x: a.x - b.x,
    y: a.y - b.y,
  }),
  
  multiply: (vec: Vector2, scalar: number): Vector2 => ({
    x: vec.x * scalar,
    y: vec.y * scalar,
  }),
  
  magnitude: (vec: Vector2): number => {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  },
  
  normalize: (vec: Vector2): Vector2 => {
    const mag = vector2.magnitude(vec);
    if (mag === 0) return { x: 0, y: 0 };
    return {
      x: vec.x / mag,
      y: vec.y / mag,
    };
  },
  
  distance: (a: Vector2, b: Vector2): number => {
    return vector2.magnitude(vector2.subtract(a, b));
  },
  
  dot: (a: Vector2, b: Vector2): number => {
    return a.x * b.x + a.y * b.y;
  },
};

// Neural network utilities
export const neuralUtils = {
  sigmoid: (x: number): number => {
    return 1 / (1 + Math.exp(-x));
  },
  
  sigmoidDerivative: (x: number): number => {
    const s = neuralUtils.sigmoid(x);
    return s * (1 - s);
  },
  
  relu: (x: number): number => {
    return Math.max(0, x);
  },
  
  reluDerivative: (x: number): number => {
    return x > 0 ? 1 : 0;
  },
  
  tanh: (x: number): number => {
    return Math.tanh(x);
  },
  
  tanhDerivative: (x: number): number => {
    const t = neuralUtils.tanh(x);
    return 1 - t * t;
  },
  
  meanSquaredError: (predicted: number[], actual: number[]): number => {
    if (predicted.length !== actual.length) {
      throw new Error('Arrays must have the same length');
    }
    
    let sum = 0;
    for (let i = 0; i < predicted.length; i++) {
      sum += Math.pow(predicted[i] - actual[i], 2);
    }
    
    return sum / predicted.length;
  },
  
  crossEntropy: (predicted: number[], actual: number[]): number => {
    if (predicted.length !== actual.length) {
      throw new Error('Arrays must have the same length');
    }
    
    let sum = 0;
    for (let i = 0; i < predicted.length; i++) {
      sum += actual[i] * Math.log(predicted[i] + 1e-8);
    }
    
    return -sum;
  },
};

// Network analysis utilities
export const networkUtils = {
  calculateDensity: (nodes: number, edges: number): number => {
    const maxEdges = (nodes * (nodes - 1)) / 2;
    return edges / maxEdges;
  },
  
  calculateClusteringCoefficient: (node: any, neighbors: any[]): number => {
    if (neighbors.length < 2) return 0;
    
    let edgesBetweenNeighbors = 0;
    const maxPossibleEdges = (neighbors.length * (neighbors.length - 1)) / 2;
    
    // This is a simplified calculation
    // In a real implementation, you'd check actual connections
    edgesBetweenNeighbors = Math.floor(Math.random() * maxPossibleEdges);
    
    return edgesBetweenNeighbors / maxPossibleEdges;
  },
  
  calculateBetweennessCentrality: (nodeId: string, nodes: any[], edges: any[]): number => {
    // Simplified betweenness centrality calculation
    // In a real implementation, you'd use Dijkstra's algorithm
    return Math.random();
  },
  
  calculateDegreeCentrality: (nodeId: string, edges: any[]): number => {
    const connections = edges.filter(edge => 
      edge.from === nodeId || edge.to === nodeId
    ).length;
    
    return connections;
  },
};

// Color utilities
export const colorUtils = {
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  
  interpolateColor: (color1: string, color2: string, factor: number): string => {
    const rgb1 = colorUtils.hexToRgb(color1);
    const rgb2 = colorUtils.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * factor);
    const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * factor);
    const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * factor);
    
    return colorUtils.rgbToHex(r, g, b);
  },
  
  getActivationColor: (activation: number): string => {
    // Map activation values to colors
    const normalized = Math.max(0, Math.min(1, activation));
    
    if (normalized < 0.33) {
      return colorUtils.interpolateColor('#1e293b', '#3b82f6', normalized * 3);
    } else if (normalized < 0.66) {
      return colorUtils.interpolateColor('#3b82f6', '#8b5cf6', (normalized - 0.33) * 3);
    } else {
      return colorUtils.interpolateColor('#8b5cf6', '#ef4444', (normalized - 0.66) * 3);
    }
  },
};

// Animation utilities
export const animationUtils = {
  easeInOut: (t: number): number => {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  },
  
  easeIn: (t: number): number => {
    return t * t;
  },
  
  easeOut: (t: number): number => {
    return t * (2 - t);
  },
  
  lerp: (start: number, end: number, factor: number): number => {
    return start + (end - start) * factor;
  },
  
  lerpVector: (start: Vector2, end: Vector2, factor: number): Vector2 => {
    return {
      x: animationUtils.lerp(start.x, end.x, factor),
      y: animationUtils.lerp(start.y, end.y, factor),
    };
  },
};
