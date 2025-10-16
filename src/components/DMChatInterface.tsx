'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Image from 'next/image';
import { MessageWithPersona, Persona, ChatEntity, getChatDisplayName, getChatImageUrl, isDirectMessage, getChatPersona } from '@/types/dm';
import { CharacterProfile } from './CharacterProfile';
import { StatusIndicator, StatusType } from './StatusIndicator';
import { ChatMessage } from './ChatMessage';
import { PartialChatMessage } from './PartialChatMessage';
import { MessageDateDivider } from './MessageDateDivider';
import { ChatProfileBlock } from './ChatProfileBlock';
import { ChatTypingArea } from './ChatTypingArea';
import { MessageSkeleton } from './MessageSkeleton';
import { useUser } from '@/hooks/useUser';

interface DMChatInterfaceProps {
  chat: ChatEntity;
  messages: MessageWithPersona[];
  loading: boolean;
  onChatRefresh?: () => void;
  onPersonaUpdate?: (updatedPersona: Persona) => void;
}

export function DMChatInterface({ chat, messages, loading, onChatRefresh, onPersonaUpdate }: DMChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const isDM = isDirectMessage(chat);
  const persona = getChatPersona(chat);
  const chatName = getChatDisplayName(chat);
  const chatImageUrl = getChatImageUrl(chat);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  // Fetch initial messages for this chat (only on mount)
  useEffect(() => {
    // Show loading state immediately when chat changes
    setIsLoadingMessages(true);
  }, [chat.id]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear loading state once parent loading is done
  useEffect(() => {
    if (!loading) {
      setIsLoadingMessages(false);
    }
  }, [loading]);

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
          directMessageId: isDM ? chat.id : undefined,
          groupId: !isDM ? chat.id : undefined,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Don't add to messages here - let the WebSocket deliver it!
      // This eliminates duplicates and ensures single source of truth
      setMessage('');
      
      // Trigger chat refresh to update sidebar ordering
      if (onChatRefresh) {
        onChatRefresh();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleRemoveFriend = async () => {
    if (!persona) return;
    if (!confirm(`Are you sure you want to remove ${persona.username} as a friend?`)) {
      return;
    }

    try {
      const response = await fetch('/api/personas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaId: persona.id,
          action: 'unfriend',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove friend');
      }

      console.log(`Removed ${persona.username} as friend`);
      // Trigger chat refresh to update sidebar
      if (onChatRefresh) {
        onChatRefresh();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert(`Failed to remove ${persona.username} as friend. Please try again.`);
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
      // setMessages(prev => prev.filter(msg => msg.id !== messageId)); // This line is removed as messages are now props
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleBlock = async () => {
    if (!persona) return;
    if (!confirm(`Are you sure you want to block ${persona.username}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/personas', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personaId: persona.id,
          action: 'erase',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to block persona');
      }

      console.log(`Blocked ${persona.username}`);
      // Trigger chat refresh to update sidebar
      if (onChatRefresh) {
        onChatRefresh();
      }
    } catch (error) {
      console.error('Error blocking persona:', error);
      alert(`Failed to block ${persona.username}. Please try again.`);
    }
  };

  const effectiveLoading = isLoadingMessages || loading;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="h-[48px] border-b border-[#404040] flex items-center px-4 bg-[#1a1a1e]">
        <div className="flex items-center gap-3">
          <div className="relative">
            {chatImageUrl ? (
              <Image
                src={chatImageUrl}
                alt={chatName}
                className="w-6 h-6 rounded-full object-cover"
                width={24}
                height={24}
                onError={(e) => {
                  e.currentTarget.src = '/avatars/default.png';
                }}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#404040] flex items-center justify-center text-xs font-semibold">
                👥
              </div>
            )}
            <StatusIndicator status={StatusType.OFFLINE} size={10} />
          </div>
          <div className="text-white font-semibold">{chatName}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {/* Main Content */}
          <div className="flex-1 bg-[#1a1a1e] overflow-hidden flex flex-col">
        {effectiveLoading ? (
          /* Loading State */
          <div className="flex-1 flex flex-col justify-end min-h-0">
            <MessageSkeleton />
          </div>
        ) : (
          /* Messages Area */
          <div className="flex-1 flex flex-col justify-end min-h-0">
            {/* Messages Container */}
            
            <div className="overflow-y-auto px-4">
              
              {/* Chat Profile Block - Shown for both DMs and Groups */}
              <div className="pb-[10px]">
                <ChatProfileBlock
                  data={chat}
                  onRemoveFriend={isDM ? handleRemoveFriend : undefined}
                  onBlock={isDM ? handleBlock : undefined}
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
                  <div key={msg.id} className={!isGroupedMessage && !showDateDivider && index !== 0 ? 'mt-4' : ''}>
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
            personaUsername={chatName}
          />
        </div>

        {/* Character Profile Sidebar - Only for DMs */}
        {isDM && persona && (
          <CharacterProfile 
            persona={persona}
            onRemoveFriend={handleRemoveFriend}
            onBlock={handleBlock}
            onPersonaUpdate={onPersonaUpdate}
          />
        )}
      </div>
    </div>
  );
}
