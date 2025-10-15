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
