'use client';

import { DMSideBar } from "./DMSideBar";
import { DMContent } from "./DMContent";
import { FriendsList, Nitro, Shop } from "./DMContentPages";
import { DMChatInterface } from "./DMChatInterface";
import { useState, useCallback, useEffect } from "react";
import { ChatEntity, Persona, MessageWithPersona, isDirectMessage } from "@/types/dm";
import { useWebSocket } from "@/hooks/useWebSocket";

export function ContentArea() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatEntity | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [messages, setMessages] = useState<MessageWithPersona[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch initial messages when chat is selected
  useEffect(() => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const isDM = isDirectMessage(selectedChat);
        const query = isDM 
          ? `directMessageId=${selectedChat.id}&limit=50`
          : `groupId=${selectedChat.id}&limit=50`;
        
        const response = await fetch(`/api/messages?${query}`);
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        // Clear old messages and set new ones atomically to prevent layout shift
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChat]);

  // Handle new messages from WebSocket (stable callback reference)
  const handleWebSocketMessage = useCallback((newMessage: MessageWithPersona) => {
    setMessages((prev) => {
      // Check if message already exists (to avoid duplicates)
      if (prev.some((msg) => msg.id === newMessage.id)) {
        return prev;
      }
      return [...prev, newMessage];
    });
  }, []);

  // Handle message deletion from WebSocket
  const handleWebSocketMessageDeleted = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  // WebSocket connection - depends on selected chat (DM or Group)
  // This stays connected to the same DM/Group until it changes
  // The hook handles server-side checks internally
  const isDMChat = selectedChat && isDirectMessage(selectedChat);
  useWebSocket({
    dmId: isDMChat ? selectedChat.id : undefined,
    groupId: !isDMChat && selectedChat ? selectedChat.id : undefined,
    onMessageReceived: handleWebSocketMessage,
    onMessageDeleted: handleWebSocketMessageDeleted,
    onConnected: () => {
      console.log('[ContentArea] WebSocket connected to chat:', selectedChat?.id);
    },
    onDisconnected: () => {
      console.log('[ContentArea] WebSocket disconnected from chat:', selectedChat?.id);
    },
  });

  const handleChatSelect = (chat: ChatEntity) => {
    // Only trigger loading if switching to a different chat
    if (selectedChat?.id !== chat.id) {
      setSelectedChat(chat);
      setSelectedPage(null); // Clear page selection when chat is selected
      setLoading(true);
      // Don't clear messages immediately - let the new chat's messages load first
      // This prevents layout shift during WebSocket reconnection
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedPage(category);
    setSelectedChat(null); // Clear chat selection when category is selected
    setMessages([]); // Clear messages
  };

  const triggerChatRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePersonaUpdate = (updatedPersona: Persona) => {
    // Update the selectedChat if it's a DM containing the updated persona
    if (selectedChat && isDirectMessage(selectedChat) && selectedChat.persona.id === updatedPersona.id) {
      setSelectedChat({
        ...selectedChat,
        persona: updatedPersona,
      });
    }
    // Trigger a refresh to update any other components that might show this persona
    triggerChatRefresh();
  };

  const renderPage = () => {
    // If a chat is selected, show chat interface
    if (selectedChat) {
      return (
        <DMChatInterface 
          chat={selectedChat} 
          messages={messages}
          loading={loading}
          onChatRefresh={triggerChatRefresh} 
          onPersonaUpdate={handlePersonaUpdate} 
        />
      );
    }

    // Otherwise show category pages
    switch (selectedPage) {
      case 'friends':
        return <FriendsList onDMSelect={handleChatSelect} onDMRefresh={triggerChatRefresh} />;
      case 'nitro':
        return <Nitro />;
      case 'shop':
        return <Shop />;
      default:
        return (
          <div className="flex-1 flex flex-col">
            <div className="w-full h-[48px] border-b border-[var(--header-border)] flex items-center px-4">
              <div className="flex-1">
                <div className="text-white/60">Welcome to Direct Messages</div>
              </div>
            </div>
            <div className="flex-1 bg-[#1a1a1e] p-4">
              <div className="h-full">
                <div className="text-white/60 text-center mt-8">
                  Select a category to get started
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-1 border-l border-t border-[var(--header-border)] bg-[#1a1a1e] flex min-h-0">
        <DMSideBar 
          onCategorySelect={handleCategorySelect} 
          selectedCategory={selectedPage} 
          onChatSelect={handleChatSelect}
          selectedChat={selectedChat}
          refreshTrigger={refreshTrigger}
        />
        <DMContent>
          {renderPage()}
        </DMContent>
      </div>
    </div>
  );
}
