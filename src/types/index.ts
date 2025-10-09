// Core types for the Neural Social Network project

export interface Vector2 {
  x: number;
  y: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Convert Vector3 to Vector2 by flattening z dimension
export const vector3ToVector2 = (vec: Vector3): Vector2 => ({
  x: vec.x,
  y: vec.y,
});

export interface Neuron {
  id: string;
  position: Vector2;
  activation: number;
  bias: number;
  connections: string[];
  layer: number;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  weight: number;
  active: boolean;
}

export interface NeuralNetwork {
  id: string;
  name: string;
  layers: number[];
  neurons: Neuron[];
  connections: Connection[];
  learningRate: number;
  epochs: number;
  currentEpoch: number;
  accuracy: number;
  loss: number;
}

export interface SocialNode {
  id: string;
  name: string;
  position: Vector2;
  connections: string[];
  attributes: Record<string, unknown>;
  centrality: number;
  community: number;
}

export interface SocialEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  type: 'friendship' | 'collaboration' | 'influence' | 'other';
}

export interface SocialNetwork {
  id: string;
  name: string;
  nodes: SocialNode[];
  edges: SocialEdge[];
  metrics: NetworkMetrics;
}

export interface NetworkMetrics {
  nodes: number;
  edges: number;
  density: number;
  clusteringCoefficient: number;
  averagePathLength: number;
  diameter: number;
  modularity: number;
}

export interface TrainingData {
  inputs: number[][];
  outputs: number[][];
  labels?: string[];
}

export interface VisualizationConfig {
  showWeights: boolean;
  showActivations: boolean;
  showBiases: boolean;
  animationSpeed: number;
  colorScheme: 'purple' | 'blue' | 'green' | 'red';
  layout: 'force' | 'hierarchical' | 'circular';
}

export interface AnalysisResult {
  type: 'centrality' | 'community' | 'path' | 'clustering';
  data: unknown;
  timestamp: Date;
}
