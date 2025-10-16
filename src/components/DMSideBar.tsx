import { DMCategoryButton } from './DMCategoryButton';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import Image from 'next/image';
import { ChatEntity, getChatDisplayName, getChatImageUrl, isDirectMessage } from "@/types/dm";
import { GroupAvatarStack } from './GroupAvatarStack';
import { StatusIndicator, StatusType } from './StatusIndicator';

interface DMSideBarProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
  onChatSelect?: (chat: ChatEntity) => void;
  selectedChat?: ChatEntity | null;
  refreshTrigger?: number; // Trigger refresh when this changes
}

export function DMSideBar({ onCategorySelect, selectedCategory, onChatSelect, selectedChat, refreshTrigger }: DMSideBarProps) {
  const queryClient = useQueryClient();

  // Fetch chats using TanStack Query
  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      try {
        // Fetch both DMs and Groups
        const [dmsResponse, groupsResponse] = await Promise.all([
          fetch('/api/direct-messages'),
          fetch('/api/groups'),
        ]);
        
        const dms = dmsResponse.ok ? await dmsResponse.json() : [];
        const groups = groupsResponse.ok ? await groupsResponse.json() : [];
        
        // Combine and sort by most recent
        const allChats = [...dms, ...groups].sort((a, b) => {
          // Use lastInteraction if available, otherwise use updatedAt
          const aTime = a.lastInteraction 
            ? new Date(a.lastInteraction).getTime() 
            : new Date(a.updatedAt).getTime();
          const bTime = b.lastInteraction 
            ? new Date(b.lastInteraction).getTime() 
            : new Date(b.updatedAt).getTime();
          return bTime - aTime;
        });
        
        return allChats;
      } catch (err) {
        console.error('Error fetching chats:', err);
        // Fallback to just DMs if groups endpoint doesn't exist yet
        try {
          const response = await fetch('/api/direct-messages');
          if (response.ok) {
            return await response.json();
          }
        } catch (fallbackErr) {
          console.error('Error fetching DMs:', fallbackErr);
        }
        return [];
      }
    },
  });

  // Invalidate chats when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  }, [refreshTrigger, queryClient]);

  return (
    <aside className="w-[302px] h-full bg-[var(--background)] rounded-tl-xl flex flex-col">
      <div className="pt-4 flex-shrink-0">
        <h2 className="text-sm font-semibold text-[var(--header-text)] mb-[11px] mx-auto w-full text-center px-2">Direct Messages</h2>
        {/* Full width divider */}
        <div className="w-full h-[1px] bg-[var(--header-border)]"></div>
        <div className="px-2">
          <div className="flex flex-col gap-[2px] mt-[9px]">
          <DMCategoryButton 
            iconSrc="/wave.svg" 
            label="Friends" 
            selected={selectedCategory === 'friends'}
            onClick={() => onCategorySelect('friends')}
          />
          <DMCategoryButton 
            iconSrc="/wave.svg" 
            label="Nitro" 
            selected={selectedCategory === 'nitro'}
            onClick={() => onCategorySelect('nitro')}
          />
          <DMCategoryButton 
            iconSrc="/wave.svg" 
            label="Shop" 
            selected={selectedCategory === 'shop'}
            onClick={() => onCategorySelect('shop')}
          />
          </div>
          <div className="w-full h-[0.75px] bg-[var(--header-border)]/75 mt-[13px]"></div>
          {/* Chat List (DMs and Groups) */}
          {chats.length > 0 && (
            <div className="mt-3">
              <div className="text-[13.5px] font-normal text-neutral-400 mb-[6px] px-2 tracking-wide">
                Direct Messages
              </div>
              <div className="space-y-1 overflow-y-auto">
                {chats.map((chat: ChatEntity) => {
                  const chatName = getChatDisplayName(chat);
                  const chatImageUrl = getChatImageUrl(chat);
                  
                  return (
                    <div
                      key={chat.id}
                      className={`flex items-center gap-3 px-2 pt-[4px] pb-[5px] rounded-md cursor-pointer transition-colors ${
                        selectedChat?.id === chat.id 
                          ? 'hover:bg-[#1d1d1e]  bg-[#2c2c30] text-white' 
                          : 'hover:bg-[#1d1d1e] text-[var(--header-text)]'
                      }`}
                      onClick={() => onChatSelect?.(chat)}
                    >
                      {/* Avatar */}
                      <div className="relative">
                        {isDirectMessage(chat) ? (
                          // DM avatar
                          <>
                            {chatImageUrl ? (
                              <Image
                                src={chatImageUrl}
                                alt={chatName}
                                className="w-8 h-8 rounded-full object-cover"
                                width={32}
                                height={32}
                                onError={(e) => {
                                  e.currentTarget.src = '/avatars/default.png';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#404040] flex items-center justify-center text-xs font-semibold text-white">
                                ?
                              </div>
                            )}
                          </>
                        ) : (
                          // Group avatar stack
                          <GroupAvatarStack participantIds={chat.participantIds} size={32} />
                        )}
                        <StatusIndicator status={StatusType.OFFLINE} size={14} />
                      </div>
                      
                      {/* Username / Chat Name */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[16px] font-medium truncate">
                          {chatName.length > 28 
                            ? `${chatName.substring(0, 29)}...` 
                            : chatName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
