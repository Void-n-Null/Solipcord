'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { NeuralNetwork, Neuron, Connection, TrainingData } from '@/types';
import { neuralUtils } from '@/lib/utils';

export interface UseNeuralNetworkOptions {
  layers: number[];
  learningRate?: number;
  activationFunction?: 'sigmoid' | 'relu' | 'tanh';
}

export const useNeuralNetwork = (options: UseNeuralNetworkOptions) => {
  const { layers, learningRate = 0.01, activationFunction = 'sigmoid' } = options;
  
  const [network, setNetwork] = useState<NeuralNetwork | null>(null);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loss, setLoss] = useState(0);
  
  const trainingRef = useRef<{
    shouldStop: boolean;
    data: TrainingData | null;
    epochs: number;
  }>({
    shouldStop: false,
    data: null,
    epochs: 0,
  });

  // Initialize network
  const initializeNetwork = useCallback(() => {
    const neurons: Neuron[] = [];
    const connections: Connection[] = [];
    let neuronId = 0;
    let connectionId = 0;

    // Create neurons for each layer
    layers.forEach((layerSize, layerIndex) => {
      for (let i = 0; i < layerSize; i++) {
        const neuron: Neuron = {
          id: `neuron-${neuronId}`,
          position: { x: layerIndex * 200, y: i * 50 },
          activation: 0,
          bias: Math.random() * 0.1 - 0.05,
          connections: [],
          layer: layerIndex,
        };
        neurons.push(neuron);
        neuronId++;
      }
    });

    // Create connections between layers
    for (let layerIndex = 0; layerIndex < layers.length - 1; layerIndex++) {
      const currentLayerSize = layers[layerIndex];
      const nextLayerSize = layers[layerIndex + 1];
      
      for (let i = 0; i < currentLayerSize; i++) {
        for (let j = 0; j < nextLayerSize; j++) {
          const fromNeuron = neurons.find(n => n.layer === layerIndex && n.id === `neuron-${layerIndex * 100 + i}`);
          const toNeuron = neurons.find(n => n.layer === layerIndex + 1 && n.id === `neuron-${(layerIndex + 1) * 100 + j}`);
          
          if (fromNeuron && toNeuron) {
            const connection: Connection = {
              id: `connection-${connectionId}`,
              from: fromNeuron.id,
              to: toNeuron.id,
              weight: Math.random() * 0.2 - 0.1,
              active: true,
            };
            connections.push(connection);
            fromNeuron.connections.push(connection.id);
            connectionId++;
          }
        }
      }
    }

    const newNetwork: NeuralNetwork = {
      id: `network-${Date.now()}`,
      name: 'Neural Network',
      layers,
      neurons,
      connections,
      learningRate,
      epochs: 0,
      currentEpoch: 0,
      accuracy: 0,
      loss: 0,
    };

    setNetwork(newNetwork);
    return newNetwork;
  }, [layers, learningRate]);

  // Forward propagation
  const forwardPropagate = useCallback((inputs: number[]): number[] => {
    if (!network) return [];

    const activations: { [key: string]: number } = {};
    
    // Set input layer activations
    const inputNeurons = network.neurons.filter(n => n.layer === 0);
    inputNeurons.forEach((neuron, index) => {
      activations[neuron.id] = inputs[index] || 0;
    });

    // Propagate through hidden and output layers
    for (let layerIndex = 1; layerIndex < layers.length; layerIndex++) {
      const layerNeurons = network.neurons.filter(n => n.layer === layerIndex);
      
      layerNeurons.forEach(neuron => {
        let sum = neuron.bias;
        
        // Sum weighted inputs from previous layer
        const incomingConnections = network.connections.filter(c => c.to === neuron.id);
        incomingConnections.forEach(connection => {
          const fromActivation = activations[connection.from] || 0;
          sum += fromActivation * connection.weight;
        });

        // Apply activation function
        let activation: number;
        switch (activationFunction) {
          case 'sigmoid':
            activation = neuralUtils.sigmoid(sum);
            break;
          case 'relu':
            activation = neuralUtils.relu(sum);
            break;
          case 'tanh':
            activation = neuralUtils.tanh(sum);
            break;
          default:
            activation = neuralUtils.sigmoid(sum);
        }

        activations[neuron.id] = activation;
      });
    }

    // Return output layer activations
    const outputNeurons = network.neurons.filter(n => n.layer === layers.length - 1);
    return outputNeurons.map(neuron => activations[neuron.id]);
  }, [network, layers, activationFunction]);

  // Calculate loss
  const calculateLoss = useCallback((predictions: number[], targets: number[]): number => {
    return neuralUtils.meanSquaredError(predictions, targets);
  }, []);

  // Calculate accuracy
  const calculateAccuracy = useCallback((predictions: number[], targets: number[]): number => {
    if (predictions.length !== targets.length) return 0;
    
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      const predictedClass = predictions[i] > 0.5 ? 1 : 0;
      const actualClass = targets[i] > 0.5 ? 1 : 0;
      if (predictedClass === actualClass) correct++;
    }
    
    return correct / predictions.length;
  }, []);

  // Train network
  const train = useCallback(async (data: TrainingData, epochs: number = 100) => {
    if (!network) return;

    setIsTraining(true);
    setCurrentEpoch(0);
    setTrainingProgress(0);
    trainingRef.current = {
      shouldStop: false,
      data,
      epochs,
    };

    for (let epoch = 0; epoch < epochs; epoch++) {
      if (trainingRef.current.shouldStop) break;

      let totalLoss = 0;
      let totalAccuracy = 0;
      const batchSize = Math.min(32, data.inputs.length);

      for (let i = 0; i < data.inputs.length; i += batchSize) {
        const batchInputs = data.inputs.slice(i, i + batchSize);
        const batchTargets = data.outputs.slice(i, i + batchSize);

        for (let j = 0; j < batchInputs.length; j++) {
          const inputs = batchInputs[j];
          const targets = batchTargets[j];

          // Forward propagation
          const predictions = forwardPropagate(inputs);
          
          // Calculate loss and accuracy
          const loss = calculateLoss(predictions, targets);
          const accuracy = calculateAccuracy(predictions, targets);
          
          totalLoss += loss;
          totalAccuracy += accuracy;

          // TODO: Implement backpropagation
          // This is a simplified version - in a real implementation,
          // you'd calculate gradients and update weights
        }
      }

      const avgLoss = totalLoss / data.inputs.length;
      const avgAccuracy = totalAccuracy / data.inputs.length;

      setLoss(avgLoss);
      setAccuracy(avgAccuracy);
      setCurrentEpoch(epoch + 1);
      setTrainingProgress(((epoch + 1) / epochs) * 100);

      // Update network state
      setNetwork(prev => prev ? {
        ...prev,
        currentEpoch: epoch + 1,
        epochs: epoch + 1,
        accuracy: avgAccuracy,
        loss: avgLoss,
      } : null);

      // Small delay to allow UI updates
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setIsTraining(false);
  }, [network, forwardPropagate, calculateLoss, calculateAccuracy]);

  // Stop training
  const stopTraining = useCallback(() => {
    trainingRef.current.shouldStop = true;
    setIsTraining(false);
  }, []);

  // Predict
  const predict = useCallback((inputs: number[]): number[] => {
    return forwardPropagate(inputs);
  }, [forwardPropagate]);

  // Reset network
  const resetNetwork = useCallback(() => {
    setIsTraining(false);
    setTrainingProgress(0);
    setCurrentEpoch(0);
    setAccuracy(0);
    setLoss(0);
    initializeNetwork();
  }, [initializeNetwork]);

  // Initialize network on mount
  useEffect(() => {
    initializeNetwork();
  }, [initializeNetwork]);

  return {
    network,
    isTraining,
    trainingProgress,
    currentEpoch,
    accuracy,
    loss,
    initializeNetwork,
    train,
    stopTraining,
    predict,
    resetNetwork,
  };
};
