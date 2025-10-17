import { ConversationContext, ContextMessage } from '@/services/context-constructor';
import { GroupPrompt } from '@/app/data/GroupPrompt';
import { DMPrompt } from '@/app/data/DMPrompt';

/**
 * Message structure for AI model
 */
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}


/**
 * Service for constructing optimized prompts from conversation context
 */
class PromptConstructor {
  /**
   * Construct a group chat response prompt
   */
  constructGroupChatPrompt(context: ConversationContext): AIMessage[] {
    // System prompt
    const system = GroupPrompt.systemPrompt(context);
    const user = GroupPrompt.userPrompt(context);
    const prefill = GroupPrompt.prefill(context);

    const messages: AIMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
      { role: 'assistant', content: prefill },
    ];


    return messages;
  }

  /**
   * Construct a direct message response prompt
   */
  constructDMPrompt(context: ConversationContext): AIMessage[] {
    // System prompt
    const system = DMPrompt.systemPrompt(context);
    const user = DMPrompt.userPrompt(context);
    const prefill = DMPrompt.prefill(context);

    const messages: AIMessage[] = [
      { role: 'system', content: system },
      { role: 'user', content: user },
      { role: 'assistant', content: prefill },
    ];

    return messages;
  }

  /**
   * Build character description from card
   */
  private buildCharacterDescription(characterCard: { name: string; description?: string }): string {
    let description = `Your name is ${characterCard.name}.`;
    
    if (characterCard.description) {
      description += `\nDescription: ${characterCard.description}`;
    }
    
    return description;
  }

  /**
   * Build a formatted list of participants
   */
  private buildParticipantsList(participants: Array<{ name: string; type: string; description?: string }>): string {
    return participants
      .filter(p => p.name !== 'You') // Skip the "You" participant for group chats
      .map(p => p.name)
      .join(', ') || 'None';
  }

  /**
   * Build formatted conversation history
   */
  private buildConversationHistory(messages: ContextMessage[]): string {
    if (messages.length === 0) {
      return '[No previous messages]';
    }

    return messages
      .map(msg => {
        const time = new Date(msg.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        return `[${time}] ${msg.sender.name}: ${msg.content}`;
      })
      .join('\n');
  }
}

// Export singleton instance
export const promptConstructor = new PromptConstructor();
