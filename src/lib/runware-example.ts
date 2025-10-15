// Example usage of Runware.ai image generation
import { 
  generateImage, 
  generateImages, 
  getAvailableModels, 
  getAvailableSchedulers, 
  getAvailableOutputFormats 
} from './runware';

// Example: Generate a single image with full API parameters
export async function exampleGenerateImage() {
  try {
    const result = await generateImage('anime girl orange hair smug headshot', {
      width: 512,
      height: 512,
      steps: 16,
      CFGScale: 1,
      model: 'runware:97@3',
      outputFormat: 'WEBP',
      scheduler: 'Default',
      includeCost: true,
      checkNSFW: true,
      outputType: ['URL'],
      outputQuality: 85,
    });
    
    console.log('Generated image:', result);
    return result;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Example: Generate multiple images with different settings
export async function exampleGenerateMultipleImages() {
  try {
    const results = await generateImages({
      positivePrompt: 'A serene landscape with mountains and a river',
      negativePrompt: 'blurry, low quality',
      width: 1024,
      height: 1024,
      numberResults: 3,
      model: 'runware:100@1',
      outputFormat: 'PNG',
      scheduler: 'EulerA',
      steps: 25,
      CFGScale: 4.0,
      includeCost: true,
      checkNSFW: true,
      outputType: ['URL', 'BASE64'],
      outputQuality: 90,
    });
    
    console.log('Generated images:', results);
    return results;
  } catch (error) {
    console.error('Error generating images:', error);
    throw error;
  }
}

// Example: Get available options
export function exampleGetAvailableOptions() {
  const models = getAvailableModels();
  const schedulers = getAvailableSchedulers();
  const outputFormats = getAvailableOutputFormats();
  
  console.log('Available models:', models);
  console.log('Available schedulers:', schedulers);
  console.log('Available output formats:', outputFormats);
  
  return { models, schedulers, outputFormats };
}
