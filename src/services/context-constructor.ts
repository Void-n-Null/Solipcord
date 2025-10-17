import { prisma } from '@/lib/database';

/**
 * Character card representation of a persona
 */
export interface CharacterCard {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  headerColor?: string;
}

/**
 * Participant in a conversation
 */
export interface ConversationParticipant {
  id: string;
  name: string;
  type: 'user' | 'persona';
  description?: string | null;
}

/**
 * Message in a conversation with sender info
 */
export interface ContextMessage {
  id: string;
  content: string;
  sender: ConversationParticipant;
  createdAt: Date;
}

/**
 * Full conversation context for prompt construction
 */
export interface ConversationContext {
  characterCard: CharacterCard;
  recentMessages: ContextMessage[];
  participants: ConversationParticipant[];
  conversationType: 'group' | 'dm';
  conversationName: string;
  conversationId: string;
}

/**
 * Service for constructing conversation context
 * Used to gather information for AI prompt generation
 */
class ContextConstructor {
  /**
   * Construct full context for a conversation
   */
  async constructContext(params: {
    personaId: string;
    conversationId: string; // groupId or directMessageId
    conversationType: 'group' | 'dm';
    messageLimit?: number;
  }): Promise<ConversationContext> {
    const { personaId, conversationId, conversationType, messageLimit = 50 } = params;

    console.log(`🔧 [CONTEXT] Constructing context for persona ${personaId} in ${conversationType} ${conversationId}`);

    try {
      // Get the persona as a character card
      const characterCard = await this.getCharacterCard(personaId);
      
      // Get recent messages from the conversation
      const recentMessages = await this.getRecentMessages(conversationId, conversationType, messageLimit);
      
      // Get participants in the conversation
      const participants = await this.getParticipants(conversationId, conversationType);
      
      // Get conversation name
      const conversationName = await this.getConversationName(conversationId, conversationType);

      console.log(`✅ [CONTEXT] Context constructed - ${recentMessages.length} messages, ${participants.length} participants`);

      return {
        characterCard,
        recentMessages,
        participants,
        conversationType,
        conversationName,
        conversationId,
      };
    } catch (error) {
      console.error(`❌ [CONTEXT] Error constructing context:`, error);
      throw error;
    }
  }

  /**
   * Get a persona as a character card
   */
  private async getCharacterCard(personaId: string): Promise<CharacterCard> {
    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
    });

    if (!persona) {
      throw new Error(`Persona ${personaId} not found`);
    }

    const description = persona.description || '';

    return {
      id: persona.id,
      name: persona.username,
      description,
      imageUrl: persona.imageUrl || undefined,
      headerColor: persona.headerColor || undefined,
    };
  }

  /**
   * Get recent messages from a conversation
   */
  private async getRecentMessages(
    conversationId: string,
    conversationType: 'group' | 'dm',
    limit: number
  ): Promise<ContextMessage[]> {
    try {
      const messages = await prisma.message.findMany({
        where: conversationType === 'group'
          ? { groupId: conversationId }
          : { directMessageId: conversationId },
        include: {
          user: true,
          persona: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Reverse to get chronological order
      return messages.reverse().map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.userId
          ? {
              id: msg.userId,
              name: msg.user?.username || 'User',
              type: 'user' as const,
            }
          : {
              id: msg.personaId || '',
              name: msg.persona?.username || 'Unknown',
              type: 'persona' as const,
              description: msg.persona?.description || undefined,
            },
        createdAt: msg.createdAt,
      }));
    } catch (error) {
      console.error(`⚠️ [CONTEXT] Error fetching messages:`, error);
      return [];
    }
  }

  /**
   * Get participants in a conversation
   */
  private async getParticipants(
    conversationId: string,
    conversationType: 'group' | 'dm'
  ): Promise<ConversationParticipant[]> {
    try {
      if (conversationType === 'group') {
        const group = await prisma.group.findUnique({
          where: { id: conversationId },
        });

        if (!group) {
          return [];
        }

        // Fetch all personas in the group
        const personas = await prisma.persona.findMany({
          where: { id: { in: group.participantIds } },
        });

        return personas.map(p => ({
          id: p.id,
          name: p.username,
          type: 'persona' as const,
          description: p.description || undefined,
        }));
      } else {
        // For DM, return the persona and note that user is also a participant
        const dm = await prisma.directMessage.findUnique({
          where: { id: conversationId },
          include: { persona: true },
        });

        if (!dm) {
          return [];
        }

        return [
          {
            id: dm.persona.id,
            name: dm.persona.username,
            type: 'persona' as const,
            description: dm.persona.description || undefined,
          },
          {
            id: 'user',
            name: 'You',
            type: 'user' as const,
          },
        ];
      }
    } catch (error) {
      console.error(`⚠️ [CONTEXT] Error fetching participants:`, error);
      return [];
    }
  }

  /**
   * Get conversation name
   */
  private async getConversationName(
    conversationId: string,
    conversationType: 'group' | 'dm'
  ): Promise<string> {
    try {
      if (conversationType === 'group') {
        const group = await prisma.group.findUnique({
          where: { id: conversationId },
        });
        return group?.name || 'Unknown Group';
      } else {
        const dm = await prisma.directMessage.findUnique({
          where: { id: conversationId },
          include: { persona: true },
        });
        return dm?.persona.username || 'Unknown';
      }
    } catch (error) {
      console.error(`⚠️ [CONTEXT] Error fetching conversation name:`, error);
      return 'Unknown';
    }
  }
}

// Export singleton instance
export const contextConstructor = new ContextConstructor();
