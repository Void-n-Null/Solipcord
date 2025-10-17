import { ConversationContext, ContextMessage } from '@/services/context-constructor';

/**
 * Constructed prompt with system and user messages
 */
export interface ConstructedPrompt {
  system: string;
  prompt: string;
}

/**
 * Service for constructing optimized prompts from conversation context
 */
class PromptConstructor {
  /**
   * Construct a group chat response prompt
   */
  constructGroupChatPrompt(context: ConversationContext): ConstructedPrompt {
    const { characterCard, participants, recentMessages, conversationName } = context;

    // Build character description
    const characterDescription = this.buildCharacterDescription(characterCard);

    // Build participants list
    const participantsList = this.buildParticipantsList(participants);

    // Build conversation history
    const conversationHistory = this.buildConversationHistory(recentMessages);

    // System prompt
    const system = `You are a persona in a Discord-like social network.

${characterDescription}

You are currently in a group chat called "${conversationName}".
Other participants: ${participantsList}

Guidelines:
- Stay in character at all times
- Keep responses concise (1-2 sentences, maximum)
- Be natural and conversational
- React naturally to what others say
- Don't overthink - respond authentically`;

    // User prompt
    const prompt = `Recent conversation history:
${conversationHistory}

Generate ${characterCard.name}'s response:`;

    return { system, prompt };
  }

  /**
   * Construct a direct message response prompt
   */
  constructDMPrompt(context: ConversationContext): ConstructedPrompt {
    const { characterCard, recentMessages } = context;

    // Build character description
    const characterDescription = this.buildCharacterDescription(characterCard);

    // Build conversation history
    const conversationHistory = this.buildConversationHistory(recentMessages);

    // System prompt
    const system = `You are an AI persona in a Discord-like social network.

${characterDescription}

You are having a direct message conversation with the user.

Guidelines:
- Stay in character at all times
- Be personable and engaging
- Keep responses concise but natural
- Show genuine interest in the conversation
- Respond authentically to what the user says`;

    // User prompt
    const prompt = `Recent conversation:
${conversationHistory}

Generate your response:`;

    return { system, prompt };
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
