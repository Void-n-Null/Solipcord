import { NextRequest, NextResponse } from 'next/server';
import { subscribeToDMMessages, subscribeToGroupMessages } from '@/lib/websocket';

/**
 * Server-Sent Events endpoint for real-time message delivery
 * Clients connect here and receive messages as they're created
 * GET /api/sse?channel=dm:dmId or channel=group:groupId
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channel = searchParams.get('channel');

  if (!channel) {
    return NextResponse.json({ error: 'Channel parameter required' }, { status: 400 });
  }

  // Parse channel to determine type (dm or group)
  const [channelType, channelId] = channel.split(':');

  if (!channelType || !channelId) {
    return NextResponse.json({ error: 'Invalid channel format' }, { status: 400 });
  }

  console.log(`🔌 [SSE] Connection: ${channel}`);

  // Create SSE stream response
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      // Send initial connected message
      const connectedMessage = 'event: connected\ndata: {"status":"connected"}\n\n';
      controller.enqueue(encoder.encode(connectedMessage));

      // Subscribe to messages based on channel type
      const unsubscribe =
        channelType === 'dm'
          ? subscribeToDMMessages(channelId, (message) => {
              try {
                const data = `data: ${JSON.stringify(message)}\n\n`;
                controller.enqueue(encoder.encode(data));
              } catch (error) {
                console.error('❌ [SSE] Error sending message:', error);
              }
            })
          : subscribeToGroupMessages(channelId, (message) => {
              try {
                const data = `data: ${JSON.stringify(message)}\n\n`;
                controller.enqueue(encoder.encode(data));
              } catch (error) {
                console.error('❌ [SSE] Error sending message:', error);
              }
            });

      // Handle client disconnect
      const cleanup = () => {
        unsubscribe();
        controller.close();
      };

      request.signal.addEventListener('abort', cleanup);
    },
  });

  return new NextResponse(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
