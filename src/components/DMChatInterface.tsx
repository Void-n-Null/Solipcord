'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { DirectMessage, MessageWithPersona, Persona } from '@/types/dm';
import { CharacterProfile } from './CharacterProfile';
import { StatusIndicator, StatusType } from './StatusIndicator';
import { ChatMessage } from './ChatMessage';
import { PartialChatMessage } from './PartialChatMessage';
import { MessageDateDivider } from './MessageDateDivider';
import { ChatProfileBlock } from './ChatProfileBlock';
import { ChatTypingArea } from './ChatTypingArea';

interface DMChatInterfaceProps {
  dm: DirectMessage;
  onDMRefresh?: () => void;
  onPersonaUpdate?: (updatedPersona: Persona) => void;
}

export function DMChatInterface({ dm, onDMRefresh, onPersonaUpdate }: DMChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageWithPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages for this DM
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/messages?directMessageId=${dm.id}&limit=50`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [dm.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          directMessageId: dm.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Trigger DM refresh to update sidebar ordering
      if (onDMRefresh) {
        onDMRefresh();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm(`Are you sure you want to remove ${dm.persona.username} as a friend?`)) {
      return;
    }

    try {
      const response = await fetch('/api/personas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaId: dm.persona.id,
          action: 'unfriend',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      console.log(`Removed ${dm.persona.username} as friend`);
      // Trigger DM refresh to update sidebar
      if (onDMRefresh) {
        onDMRefresh();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert(`Failed to remove ${dm.persona.username} as friend. Please try again.`);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleBlock = async () => {
    if (!confirm(`Are you sure you want to block ${dm.persona.username}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/personas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaId: dm.persona.id,
          action: 'erase',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to block persona');
      }

      console.log(`Blocked ${dm.persona.username}`);
      // Trigger DM refresh to update sidebar
      if (onDMRefresh) {
        onDMRefresh();
      }
    } catch (error) {
      console.error('Error blocking persona:', error);
      alert(`Failed to block ${dm.persona.username}. Please try again.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="h-[48px] border-b border-[#404040] flex items-center px-4 bg-[#1a1a1e]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={dm.persona.imageUrl || '/avatars/default.png'}
              alt={dm.persona.username}
              className="w-6 h-6 rounded-full object-cover"
              width={24}
              height={24}
              onError={(e) => {
                e.currentTarget.src = '/avatars/default.png';
              }}
            />
            <StatusIndicator status={StatusType.OFFLINE} size={10} />
          </div>
          <div className="text-white font-semibold">{dm.persona.username}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Main Content */}
          <div className="flex-1 bg-[#1a1a1e] overflow-hidden flex flex-col">
        {loading ? (
          /* Loading State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[#b9bbbe]">Loading messages...</div>
          </div>
        ) : (
          /* Messages Area */
          <div className="flex-1 flex flex-col justify-end min-h-0">
            {/* Messages Container */}
            
            <div className="overflow-y-auto px-4">
              
              {/* Persona Information Block - Always visible at top */}
              <div className="pb-[10px]">
              <ChatProfileBlock
                persona={dm.persona}
                onRemoveFriend={handleRemoveFriend}
                onBlock={handleBlock}
              />
              </div>

              {messages.length > 0 && (
                <MessageDateDivider date={new Date(messages[0].createdAt)} size="sm" />
              )}
              
              {messages.map((msg, index) => {
                const currentDate = new Date(msg.createdAt).toDateString();
                const previousDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
                const showDateDivider = previousDate && currentDate !== previousDate;

                // Check if this message should be grouped with the previous one
                const isGroupedMessage = index > 0 && (() => {
                  const prevMsg = messages[index - 1];
                  const currentTime = new Date(msg.createdAt).getTime();
                  const prevTime = new Date(prevMsg.createdAt).getTime();
                  const timeDiff = currentTime - prevTime;
                  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
                  
                  // Group if within 5 minutes and same sender
                  return timeDiff <= fiveMinutes && 
                         msg.persona?.id === prevMsg.persona?.id &&
                         msg.user?.id === prevMsg.user?.id;
                })();

                return (
                  <div key={msg.id} className={!isGroupedMessage ? 'mt-4' : ''}>
                    {showDateDivider && (
                      <MessageDateDivider date={new Date(msg.createdAt)} />
                    )}
                    
                    {isGroupedMessage ? (
                      <PartialChatMessage msg={msg} onDelete={handleDeleteMessage} />
                    ) : (
                      <ChatMessage msg={msg} onDelete={handleDeleteMessage} />
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
              <div className="h-5"></div>
            </div>

          </div>
          )}
          </div>

          {/* Message Input */}
          <ChatTypingArea
            message={message}
            onMessageChange={setMessage}
            onSendMessage={handleSendMessage}
            personaUsername={dm.persona.username}
          />
        </div>

        {/* Character Profile Sidebar */}
        <CharacterProfile 
          persona={dm.persona}
          onRemoveFriend={handleRemoveFriend}
          onBlock={handleBlock}
          onPersonaUpdate={onPersonaUpdate}
        />
      </div>
    </div>
  );
}
