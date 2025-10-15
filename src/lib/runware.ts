// Runware.ai API integration based on official specification
// https://runware.ai/docs/en/image-inference/api-reference

export interface ImageGenerationOptions {
  // Required
  positivePrompt: string;
  
  // Optional parameters
  negativePrompt?: string;
  height?: number;
  width?: number;
  model?: string;
  steps?: number;
  CFGScale?: number;
  numberResults?: number;
  seed?: number;
  
  // Additional API parameters
  taskType?: 'imageInference';
  outputFormat?: 'WEBP' | 'PNG' | 'JPEG';
  scheduler?: 'Default' | 'DPM++' | 'Euler' | 'EulerA' | 'Heun' | 'DDIM' | 'DPM' | 'DPM2' | 'DPM2A' | 'LMS' | 'LMSK' | 'PLMS' | 'UniPC';
  includeCost?: boolean;
  checkNSFW?: boolean;
  outputType?: ('URL' | 'BASE64')[];
  outputQuality?: number;
  taskUUID?: string;
}

export interface GeneratedImage {
  image: string; // URL or Base64 encoded image
  seed: number;
  model: string;
  cost?: number;
  taskUUID?: string;
}

export interface RunwareApiResponse {
  success: boolean;
  data?: GeneratedImage[];
  error?: string;
  cost?: number;
}

/**
 * Generate images using Runware.ai API
 */
export async function generateImages(options: ImageGenerationOptions): Promise<GeneratedImage[]> {
  try {
    const apiKey = process.env.RUNWARE_API_KEY;
    if (!apiKey) {
      throw new Error('RUNWARE_API_KEY environment variable is required');
    }

    // Generate task UUID if not provided
    const taskUUID = options.taskUUID || crypto.randomUUID();

    const requestBody = [
      {
        taskType: options.taskType || 'imageInference',
        model: options.model || 'runware:97@3',
        numberResults: options.numberResults || 1,
        outputFormat: options.outputFormat || 'WEBP',
        width: options.width || 512,
        height: options.height || 512,
        steps: options.steps || 16,
        CFGScale: options.CFGScale || 1,
        scheduler: options.scheduler || 'Default',
        includeCost: options.includeCost ?? true,
        checkNSFW: options.checkNSFW ?? true,
        outputType: options.outputType || ['URL'],
        outputQuality: options.outputQuality || 85,
        positivePrompt: options.positivePrompt,
        ...(options.negativePrompt && options.negativePrompt.length >= 2 && { negativePrompt: options.negativePrompt }),
        seed: options.seed,
        taskUUID: taskUUID,
      }
    ];

    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Runware API error response:', errorText);
      throw new Error(`Runware API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    // Handle the correct response format: { data: [...] }
    if (!data || !data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format:', data);
      throw new Error(`Invalid response format from Runware API. Expected object with data array, got: ${typeof data}`);
    }

    return data.data.map((item: Record<string, unknown>) => ({
      image: (item.imageURL as string) || (item.image as string) || '',
      seed: (item.seed as number) || 0,
      model: (item.model as string) || options.model || 'runware:97@3',
      cost: item.cost as number | undefined,
      taskUUID: (item.taskUUID as string) || taskUUID,
    }));
  } catch (error) {
    console.error('Error generating images with Runware:', error);
    throw new Error(`Failed to generate images: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a single image with simplified options
 */
export async function generateImage(
  prompt: string,
  options?: Partial<ImageGenerationOptions>
): Promise<GeneratedImage> {
  const images = await generateImages({
    positivePrompt: prompt,
    numberResults: 1,
    ...options,
  });
  
  return images[0];
}

/**
 * Get available models from Runware
 * Returns common models - check Runware docs for full list
 */
export function getAvailableModels(): string[] {
  return [
    'runware:97@3',
    'runware:100@1',
    'runware:100@2',
    'runware:100@3',
    'runware:101@1',
    'runware:102@1',
  ];
}

/**
 * Get available schedulers
 */
export function getAvailableSchedulers(): string[] {
  return [
    'Default',
    'DPM++',
    'Euler',
    'EulerA',
    'Heun',
    'DDIM',
    'DPM',
    'DPM2',
    'DPM2A',
    'LMS',
    'LMSK',
    'PLMS',
    'UniPC',
  ];
}

/**
 * Get available output formats
 */
export function getAvailableOutputFormats(): string[] {
  return ['WEBP', 'PNG', 'JPEG'];
}
