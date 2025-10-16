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

  console.log(`\n[SSE CONNECTION] ╔════════════════════════════════════════════════════════════════════════════════╗`);
  console.log(`[SSE CONNECTION] ║ NEW CLIENT CONNECTION`);
  console.log(`[SSE CONNECTION] ╚════════════════════════════════════════════════════════════════════════════════╝`);
  console.log(`[SSE CONNECTION] Channel: ${channel}`);
  console.log(`[SSE CONNECTION] Type: ${channelType.toUpperCase()}`);
  console.log(`[SSE CONNECTION] ID: ${channelId}`);

  // Create SSE stream response
  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      console.log(`[SSE CONNECTION] ✅ ReadableStream started`);

      // Send initial connected message
      const connectedMessage = 'event: connected\ndata: {"status":"connected"}\n\n';
      controller.enqueue(encoder.encode(connectedMessage));
      console.log(`[SSE CONNECTION] Sent connected acknowledgement`);

      // Subscribe to messages based on channel type
      const unsubscribe =
        channelType === 'dm'
          ? subscribeToDMMessages(channelId, (message) => {
              console.log(`\n[SSE MESSAGE] ========== MESSAGE DELIVERY ==========`);
              console.log(`[SSE MESSAGE] Channel ID: ${channelId}`);
              console.log(`[SSE MESSAGE] Message ID: ${message.id}`);
              console.log(`[SSE MESSAGE] Message from: ${message.personaId ? 'PERSONA' : 'USER'}`);
              try {
                const data = `data: ${JSON.stringify(message)}\n\n`;
                console.log(`[SSE MESSAGE] ✅ Enqueuing to client...`);
                controller.enqueue(encoder.encode(data));
                console.log(`[SSE MESSAGE] ✅ Successfully sent to client\n`);
              } catch (error) {
                console.error('[SSE MESSAGE] ❌ Error sending message:', error);
              }
            })
          : subscribeToGroupMessages(channelId, (message) => {
              console.log(`\n[SSE MESSAGE] ========== MESSAGE DELIVERY ==========`);
              console.log(`[SSE MESSAGE] Channel ID: ${channelId}`);
              console.log(`[SSE MESSAGE] Message ID: ${message.id}`);
              try {
                const data = `data: ${JSON.stringify(message)}\n\n`;
                console.log(`[SSE MESSAGE] ✅ Enqueuing to client...`);
                controller.enqueue(encoder.encode(data));
                console.log(`[SSE MESSAGE] ✅ Successfully sent to client\n`);
              } catch (error) {
                console.error('[SSE MESSAGE] Error sending message:', error);
              }
            });

      console.log(`[SSE CONNECTION] ✅ Subscription created and waiting for messages`);
      console.log(`[SSE CONNECTION] Channel ready: ${channel}`);

      // Handle client disconnect
      const cleanup = () => {
        console.log(`\n[SSE DISCONNECT] ╔════════════════════════════════════════════════════════════════════════════════╗`);
        console.log(`[SSE DISCONNECT] ║ CLIENT DISCONNECTED`);
        console.log(`[SSE DISCONNECT] ╚════════════════════════════════════════════════════════════════════════════════╝`);
        console.log(`[SSE DISCONNECT] Channel: ${channel}`);
        console.log(`[SSE DISCONNECT] Time: ${new Date().toISOString()}`);
        console.log(`[SSE DISCONNECT] Calling unsubscribe function...`);
        unsubscribe();
        console.log(`[SSE DISCONNECT] ✅ Unsubscribed from channel`);
        console.log(`[SSE DISCONNECT] Closing controller...`);
        controller.close();
        console.log(`[SSE DISCONNECT] ✅ Controller closed\n`);
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
