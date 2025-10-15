'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Gift, Smile, Gamepad2 } from 'lucide-react';
import { DirectMessage, MessageWithPersona, Persona } from '@/types/dm';
import { CharacterProfile } from './CharacterProfile';
import { StatusIndicator, StatusType } from './StatusIndicator';

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
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Content */}
          <div className="flex-1 bg-[#1a1a1e] overflow-hidden">
        {loading ? (
          /* Loading State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-[#b9bbbe]">Loading messages...</div>
          </div>
        ) : (
          /* Messages Area */
          <div className="flex-1 flex flex-col h-full justify-end">
            {/* Persona Information Block - Always visible */}
            <div className="flex items-start gap-4 p-6 px-3 pb-[10px]">
              {/* Profile Picture */}
              <div className="relative pl-1">
                <Image
                  src={dm.persona.imageUrl || '/avatars/default.png'}
                  alt={dm.persona.username}
                  className="w-20 h-20 rounded-full object-cover"
                  width={128}
                  height={128}
                  onError={(e) => {
                    e.currentTarget.src = '/avatars/default.png';
                  }}
                />

                {/* Display Name */}
                <h2 className="text-[30px] font-bold text-white mb-1 mt-2">{dm.persona.username}</h2>
                
                {/* Username */}
                <p className="text-white text-2xl mb-3">{dm.persona.username}</p>

                                {/* DM History Message */}
                                <p className="text-neutral-200 text-md mb-3">
                  This is the beginning of your direct message history with <b>{dm.persona.username}</b>.
                </p>

                {/* Mutual Server and Actions */}
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-sm"></div>
                  </div>
                  <span className="text-[#b9bbbe] text-sm">1 Mutual Server</span>
                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={handleRemoveFriend}
                      className="px-3 py-1 bg-[#40444b] text-white text-xs font-medium rounded hover:bg-[#4f545c] transition-colors"
                    >
                      Remove Friend
                    </button>
                    <button
                      onClick={handleBlock}
                      className="px-3 py-1 bg-[#40444b] text-white text-xs font-medium rounded hover:bg-[#4f545c] transition-colors"
                    >
                      Block
                    </button>
                  </div>
                </div>
              </div>
    
            </div>

            {/* Messages Container */}
            <div className="overflow-y-auto p-4 space-y-1 max-h-96">
              {messages.length > 0 && (
                <div className="flex items-center justify-center">
                  <div className="flex items-center w-full">
                    <div className="flex-1 h-px bg-[#404040]"></div>
                    <div className="px-4 text-[#b9bbbe] text-sm">
                      {new Date(messages[0].createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex-1 h-px bg-[#404040]"></div>
                  </div>
                </div>
              )}
              
              {messages.map((msg, index) => {
                const currentDate = new Date(msg.createdAt).toDateString();
                const previousDate = index > 0 ? new Date(messages[index - 1].createdAt).toDateString() : null;
                const showDateDivider = previousDate && currentDate !== previousDate;

                return (
                  <div key={msg.id}>
                    {showDateDivider && (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center w-full">
                          <div className="flex-1 h-px bg-[#404040]"></div>
                          <div className="px-4 text-[#b9bbbe] text-sm">
                            {new Date(msg.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex-1 h-px bg-[#404040]"></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3">
                      <Image
                        src={msg.persona?.imageUrl || '/avatars/default.png'}
                        alt={msg.persona?.username || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                        width={40}
                        height={40}
                        onError={(e) => {
                          e.currentTarget.src = '/avatars/default.png';
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-white font-semibold">
                            {msg.persona?.username || 'You'}
                          </span>
                          <span className="text-[#b9bbbe] text-xs">
                            {new Date(msg.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-[#dcddde]">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
          )}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-[#1a1a1e] border-t border-[#404040]">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              {/* Plus Button */}
              <button
                type="button"
                className="p-2 text-[#b9bbbe] hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              
              {/* Message Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Message @${dm.persona.username}`}
                  className="w-full bg-[#40444b] text-white placeholder-[#72767d] px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-0"
                />
              </div>
              
              {/* Action Icons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 text-[#b9bbbe] hover:text-white transition-colors"
                >
                  <Gift className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-[#b9bbbe] hover:text-white transition-colors"
                >
                  <span className="text-xs font-semibold">GIF</span>
                </button>
                <button
                  type="button"
                  className="p-2 text-[#b9bbbe] hover:text-white transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-[#b9bbbe] hover:text-white transition-colors"
                >
                  <Gamepad2 className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
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
