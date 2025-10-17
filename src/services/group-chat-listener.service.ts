import { messageEvents } from '@/events/message.events';
import { messageService } from '@/services/message.service';
import { contextConstructor } from '@/services/context-constructor';
import { promptConstructor } from '@/services/prompt-constructor';
import { aiUtils } from '@/lib/utils';
import { prisma } from '@/lib/database';

/**
 * Service for cleaning message content by removing XML-like tags
 */
class MessageCleanserService {
  /**
   * Clean message content by removing XML-like tags
   * @param content - The message content to clean
   * @param tagsToHideContent - Optional array of tag names whose content should be removed entirely
   * @returns Cleaned message content
   *
   * @example
   * // Remove tags but keep content
   * cleanMessage('<test>Hi</test> There') // Returns: 'Hi There'
   *
   * @example
   * // Remove tags and hide content of specific tags
   * cleanMessage('<test>Hi</test> There', ['test']) // Returns: ' There'
   *
   * @example
   * // Handle orphaned closing tags (no opening tag)
   * cleanMessage('Hello there </message>', ['message']) // Returns: ''
   */
  cleanMessage(content: string, tagsToHideContent: string[] = []): string {
    let cleaned = content;

    // First pass: Remove tags and their content for tags in the hide list
    if (tagsToHideContent.length > 0) {
      for (const tagName of tagsToHideContent) {
        // Escape special regex characters in tag name
        const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Step 1: Remove properly paired tags first (opening + content + closing)
        // This handles both self-closing tags and tags with content
        const tagPattern = new RegExp(
          `<${escapedTag}(?:\\s[^>]*)?>.*?</${escapedTag}>|<${escapedTag}(?:\\s[^>]*)?/>`,
          'gs'
        );
        cleaned = cleaned.replace(tagPattern, '');

        // Step 2: Handle orphaned closing tags (closing tag without opening tag)
        // After removing paired tags, any remaining closing tags are orphaned
        // Remove everything from the start up to and including each orphaned closing tag
        const closingTagPattern = new RegExp(`</${escapedTag}>`, 'g');

        while (closingTagPattern.test(cleaned)) {
          // Find the first closing tag
          const closingMatch = cleaned.match(new RegExp(`^(.*?)</${escapedTag}>`, 's'));

          if (closingMatch) {
            // Remove everything from start up to and including the closing tag
            cleaned = cleaned.substring(closingMatch[0].length);
          } else {
            break;
          }
        }
      }
    }

    // Second pass: Remove all remaining XML-like tags but keep their content
    // This matches any tag (opening or closing) like <anything> or </anything>
    cleaned = cleaned.replace(/<\/?[^>]+>/g, '');

    return cleaned;
  }

  /**
   * Clean message content with custom tag configurations
   * @param content - The message content to clean
   * @param options - Configuration options
   * @returns Cleaned message content
   */
  cleanMessageWithOptions(
    content: string,
    options: {
      tagsToHideContent?: string[];
      removeAllTags?: boolean;
    } = {}
  ): string {
    const { tagsToHideContent = [], removeAllTags = true } = options;

    let cleaned = content;

    // Remove tags and their content for specified tags
    if (tagsToHideContent.length > 0) {
      for (const tagName of tagsToHideContent) {
        const escapedTag = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Step 1: Remove properly paired tags first
        const tagPattern = new RegExp(
          `<${escapedTag}(?:\\s[^>]*)?>.*?</${escapedTag}>|<${escapedTag}(?:\\s[^>]*)?/>`,
          'gs'
        );
        cleaned = cleaned.replace(tagPattern, '');

        // Step 2: Handle orphaned closing tags
        // After removing paired tags, any remaining closing tags are orphaned
        const closingTagPattern = new RegExp(`</${escapedTag}>`, 'g');

        while (closingTagPattern.test(cleaned)) {
          // Find the first closing tag
          const closingMatch = cleaned.match(new RegExp(`^(.*?)</${escapedTag}>`, 's'));

          if (closingMatch) {
            // Remove everything from start up to and including the closing tag
            cleaned = cleaned.substring(closingMatch[0].length);
          } else {
            break;
          }
        }
      }
    }

    // Remove all remaining tags if configured
    if (removeAllTags) {
      cleaned = cleaned.replace(/<\/?[^>]+>/g, '');
    }

    return cleaned;
  }
}

// Singleton instance
export const messageCleanser = new MessageCleanserService();

/**
 * Background service that listens to all group chat conversations
 * and auto-responds when users send messages
 */
class GroupChatListenerService {
  private listeners: Map<string, () => void> = new Map();
  private isRunning: boolean = false;

  /**
   * Start listening to a specific group conversation
   */
  private startListeningToGroup(groupId: string) {
    // Check if already listening
    if (this.listeners.has(groupId)) {
      console.log(`ℹ️ [GROUP] Already listening to group ${groupId}`);
      return;
    }

    console.log(`📍 [GROUP] Starting listener for group ${groupId}`);

    // Set up listener for this specific group
    const unsubscribe = messageEvents.onGroupMessageCreated(async (event) => {
      // Filter by group ID to ensure we only process messages for this specific group
      if (event.groupId !== groupId) {
        return;
      }

      console.log(`🔔 [GROUP] Listener triggered: "${event.message.content}"`);
      const sender = event.message.userId ? `User ${event.message.userId}` : `Persona ${event.message.personaId}`;
      console.log(`👤 [GROUP] From: ${sender}`);

      // Only respond to user messages (not persona messages)
      if (!event.message.userId) {
        console.log('⏭️ [GROUP] Skipping - message is from persona');
        return;
      }

      console.log('✅ [GROUP] Generating AI responses for all participants');

      try {
        // Fetch group details to get participant IDs
        const group = await prisma.group.findUnique({
          where: { id: groupId },
        });

        if (!group) {
          console.error(`❌ [GROUP] Group ${groupId} not found`);
          return;
        }

        // Have each persona respond in parallel
        const responsePromises = group.participantIds
          .filter(personaId => event.message.personaId !== personaId) // Skip the sender
          .map(async (personaId) => {
            console.log(`🤖 [GROUP] Generating AI response from persona: ${personaId}`);
            
            try {
              // Build conversation context
              const context = await contextConstructor.constructContext({
                personaId,
                conversationId: groupId,
                conversationType: 'group',
                messageLimit: 50,
              });

              // Construct prompt from context with prefill
              const messages = promptConstructor.constructGroupChatPrompt(context);

              console.log(`📝 [GROUP] Prompt constructed for ${context.characterCard.name}`);

              // Generate AI response
              const response = await aiUtils.generateText({
                messages,
                temperature: 0.7,
              });

              console.log(`📤 [GROUP] Generated response from ${context.characterCard.name}: "${response.substring(0, 100)}..."`);

              // Clean the response to remove XML tags before sending
              const cleanedResponse = messageCleanser.cleanMessageWithOptions(response, {
                tagsToHideContent: ['initial_understanding', 'thinking', 'post_response'],
              });

              // Create message with the cleaned response
              await messageService.createMessage({
                content: cleanedResponse,
                personaId: personaId,
                groupId: groupId,
              });
            } catch (personaError) {
              console.error(`❌ [GROUP] Failed to generate/send response for persona ${personaId}:`, personaError);
            }
          });

        // Wait for all personas to respond in parallel
        await Promise.all(responsePromises);
        
        console.log('✅ [GROUP] All AI responses generated and sent successfully');

      } catch (error) {
        console.error('❌ [GROUP] Failed to generate responses:', error);
      }
    });

    // Store the unsubscribe function
    this.listeners.set(groupId, unsubscribe);
  }

  /**
   * Stop listening to a specific group conversation
   */
  stopListeningToGroup(groupId: string) {
    const unsubscribe = this.listeners.get(groupId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(groupId);
      console.log(`✅ [GROUP] Stopped listening to group ${groupId}`);
    }
  }

  /**
   * Initialize the service by fetching all groups and setting up listeners
   */
  async initialize() {
    if (this.isRunning) {
      console.log('ℹ️ [GROUP] Service already running');
      return;
    }

    console.log('🚀 [GROUP] Initializing group chat listener service');

    try {
      // Import database directly (server-side)
      const { db } = await import('@/lib/database');

      // Fetch all existing groups from database
      const groups = await db.getAllGroups();
      console.log(`📊 [GROUP] Found ${groups.length} group conversations`);

      // Set up listener for each group
      for (const group of groups) {
        console.log(`✅ [GROUP] Setting up listener: ${group.name}`);
        this.startListeningToGroup(group.id);
      }

      this.isRunning = true;
      console.log(`✅ [GROUP] Service running - ${this.listeners.size} active listeners`);
    } catch (error) {
      console.error('❌ [GROUP] Failed to initialize service:', error);
      throw error;
    }
  }

  /**
   * Add a listener for a newly created group
   */
  async addGroupListener(groupId: string) {
    console.log(`ℹ️ [GROUP] Adding listener for new group ${groupId}`);
    
    try {
      const { db } = await import('@/lib/database');
      const group = await db.getGroupById(groupId);
      
      if (!group) {
        console.error(`❌ [GROUP] Group ${groupId} not found`);
        return;
      }

      this.startListeningToGroup(groupId);
    } catch (error) {
      console.error(`❌ [GROUP] Failed to add listener for group ${groupId}:`, error);
    }
  }

  /**
   * Stop all listeners and shut down the service
   */
  shutdown() {
    console.log('🛑 [GROUP] Shutting down service...');

    for (const [groupId, unsubscribe] of this.listeners.entries()) {
      unsubscribe();
      console.log(`✅ [GROUP] Stopped listener for group ${groupId}`);
    }

    this.listeners.clear();
    this.isRunning = false;
    console.log('✅ [GROUP] Service shut down');
  }

  /**
   * Get status of the service
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeListeners: this.listeners.size,
      groupIds: Array.from(this.listeners.keys()),
    };
  }

  /**
   * Check if service is running
   */
  isServiceRunning() {
    return this.isRunning;
  }
}

// Singleton instance
export const groupChatListenerService = new GroupChatListenerService();
