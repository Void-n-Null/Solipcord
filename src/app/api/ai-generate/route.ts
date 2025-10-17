import { NextRequest, NextResponse } from 'next/server';
import { aiUtils } from '@/lib/utils';

/**
 * POST /api/ai-generate
 * 
 * Generate AI responses for group chat messages using OpenRouter
 * 
 * Request body:
 * {
 *   "personaName": string,
 *   "personaDescription"?: string,
 *   "message": string,
 *   "groupName": string,
 *   "otherParticipants": string[]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { personaName, message, groupName, otherParticipants } = body;
    
    if (!personaName || !message || !groupName || !Array.isArray(otherParticipants)) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['personaName', 'message', 'groupName', 'otherParticipants'],
        },
        { status: 400 }
      );
    }

    console.log(`🤖 [API] Generating response for persona: ${personaName}`);

    // Generate the response
    const response = await aiUtils.generateGroupChatResponse({
      personaName,
      personaDescription: body.personaDescription || undefined,
      message,
      groupName,
      otherParticipants,
    });

    console.log(`✅ [API] Response generated successfully`);

    return NextResponse.json(
      {
        success: true,
        response,
        metadata: {
          personaName,
          groupName,
          messageLength: message.length,
          responseLength: response.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ [API] Error generating response:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai-generate
 * 
 * Returns documentation and usage information
 */
export async function GET() {
  return NextResponse.json({
    message: 'OpenRouter AI Generation API',
    endpoint: '/api/ai-generate',
    method: 'POST',
    description: 'Generate AI responses for group chat messages using OpenRouter and GPT-4 OSS 120B model',
    requestBody: {
      personaName: {
        type: 'string',
        description: 'Name of the persona responding',
        example: 'Alice',
      },
      personaDescription: {
        type: 'string',
        description: 'Optional description of the persona for context',
        example: 'A friendly and outgoing person',
      },
      message: {
        type: 'string',
        description: 'The message to respond to',
        example: 'What do you think about AI?',
      },
      groupName: {
        type: 'string',
        description: 'Name of the group chat',
        example: 'AI Enthusiasts',
      },
      otherParticipants: {
        type: 'array',
        description: 'Array of other participant names',
        example: ['Bob', 'Charlie'],
      },
    },
    responseFormat: {
      success: 'boolean',
      response: 'string - The generated response',
      metadata: {
        personaName: 'string',
        groupName: 'string',
        messageLength: 'number',
        responseLength: 'number',
        timestamp: 'ISO string',
      },
    },
    exampleRequest: {
      method: 'POST',
      url: 'http://localhost:3000/api/ai-generate',
      body: {
        personaName: 'Alice',
        personaDescription: 'A tech enthusiast and creative thinker',
        message: 'Hey everyone, I just finished my first AI project!',
        groupName: 'Tech Innovators',
        otherParticipants: ['Bob', 'Charlie'],
      },
    },
    requirements: {
      environment: 'OPENROUTER_API_KEY must be set in .env',
      model: 'openai/gpt-oss-120b (via OpenRouter)',
      provider: 'Cerebras (provider)',
    },
  });
}
