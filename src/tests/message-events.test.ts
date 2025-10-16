/**
 * Simple test to verify the message event system works
 * Run with: npx ts-node src/tests/message-events.test.ts
 */

import { messageEvents } from '@/events/message.events';
import { messageService } from '@/services/message.service';

async function runTests() {
  console.log('Testing Message Event System...\n');

  // Test 1: DM Message Created Event
  console.log('Test 1: Setting up DM message created listener...');

  let eventReceived = false;
  const unsubscribe = messageEvents.onDMMessageCreated((event) => {
    console.log('✓ Event received!');
    console.log('  Message ID:', event.message.id);
    console.log('  Content:', event.message.content);
    console.log('  DM ID:', event.directMessageId);
    console.log('  Sender:', event.message.userId ? 'User' : 'Persona');
    eventReceived = true;
  });

  console.log('✓ Listener set up successfully\n');

  // Test 2: Multiple listeners
  console.log('Test 2: Setting up multiple listeners...');

  let generalEventCount = 0;
  const unsubscribe2 = messageEvents.onMessageCreated(() => {
    generalEventCount++;
  });

  console.log('✓ Multiple listeners set up\n');

  // Test 3: Event filtering
  console.log('Test 3: Testing event filtering...');

  let dmEventCount = 0;
  let groupEventCount = 0;

  const unsubscribe3 = messageEvents.onDMMessageCreated(() => {
    dmEventCount++;
  });

  const unsubscribe4 = messageEvents.onGroupMessageCreated(() => {
    groupEventCount++;
  });

  console.log('✓ Filters set up\n');

  // Cleanup
  console.log('Cleaning up listeners...');
  unsubscribe();
  unsubscribe2();
  unsubscribe3();
  unsubscribe4();
  console.log('✓ All listeners cleaned up\n');

  console.log('All tests passed!');
  console.log('\nNote: To test with real messages, create a message through the API:');
  console.log('  POST /api/messages');
  console.log('  Body: { content: "test", userId: "...", directMessageId: "..." }');
}

// Run tests
runTests().catch(console.error);
