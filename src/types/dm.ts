export interface Persona {
  id: string;
  username: string;
  imageUrl?: string;
  headerColor?: string;
  friendsIds: string[];
  isFriendOfUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  userId?: string;
  personaId?: string;
  groupId?: string;
  directMessageId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageWithPersona extends Message {
  persona?: Persona;
  user?: {
    id: string;
    username: string;
    email?: string;
    avatar?: string;
  };
}

export interface DirectMessage {
  id: string;
  personaId: string;
  persona: Persona;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  participantIds: string[];
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// Union type for both chat types
export type ChatEntity = DirectMessage | Group;

// Type guard: check if chat entity is a DirectMessage
export function isDirectMessage(chat: ChatEntity): chat is DirectMessage {
  return 'persona' in chat;
}

// Type guard: check if chat entity is a Group
export function isGroup(chat: ChatEntity): chat is Group {
  return 'participantIds' in chat;
}

// Helper: get display name for a chat entity
export function getChatDisplayName(chat: ChatEntity): string {
  if (isDirectMessage(chat)) {
    return chat.persona.username;
  } else {
    return chat.name;
  }
}

// Helper: get image URL for a chat entity
export function getChatImageUrl(chat: ChatEntity): string | null | undefined {
  if (isDirectMessage(chat)) {
    return chat.persona.imageUrl;
  } else {
    // For groups, return undefined (we can show a group icon or handle in component)
    return undefined;
  }
}

// Helper: get persona from DM (or undefined for groups)
export function getChatPersona(chat: ChatEntity): Persona | undefined {
  if (isDirectMessage(chat)) {
    return chat.persona;
  }
  return undefined;
}
