import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '@/lib/runware';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, options } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Generate image using Runware API
    const result = await generateImage(prompt, options || {});

    return NextResponse.json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('RUNWARE_API_KEY')) {
        return NextResponse.json(
          { error: 'Runware API key not configured. Please check your environment variables.' },
          { status: 500 }
        );
      } else if (error.message.includes('401')) {
        return NextResponse.json(
          { error: 'Invalid Runware API key. Please check your API key.' },
          { status: 401 }
        );
      } else if (error.message.includes('429')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      } else if (error.message.includes('402')) {
        return NextResponse.json(
          { error: 'Insufficient credits. Please add credits to your Runware account.' },
          { status: 402 }
        );
      } else if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Network error connecting to Runware API. Please check your internet connection.' },
          { status: 503 }
        );
      } else {
        return NextResponse.json(
          { error: `Image generation failed: ${error.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Unknown error occurred during image generation' },
      { status: 500 }
    );
  }
}
