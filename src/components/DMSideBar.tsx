import { DMCategoryButton } from './DMCategoryButton';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Persona, DirectMessage } from "@/types/dm";
import { StatusIndicator, StatusType } from './StatusIndicator';

interface DMSideBarProps {
  onCategorySelect: (category: string) => void;
  selectedCategory: string | null;
  onDMSelect?: (dm: DirectMessage) => void;
  selectedDM?: DirectMessage | null;
  refreshTrigger?: number; // Trigger refresh when this changes
}

export function DMSideBar({ onCategorySelect, selectedCategory, onDMSelect, selectedDM, refreshTrigger }: DMSideBarProps) {
  const [dms, setDms] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch DMs from database
  const fetchDMs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/direct-messages');
      if (!response.ok) {
        throw new Error('Failed to fetch DMs');
      }
      const data = await response.json();
      setDms(data);
    } catch (err) {
      console.error('Error fetching DMs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDMs();
  }, []);

  // Refresh DMs when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      fetchDMs();
    }
  }, [refreshTrigger]);

  // Refresh DMs when a new one is created
  const refreshDMs = async () => {
    try {
      const response = await fetch('/api/direct-messages');
      if (!response.ok) {
        throw new Error('Failed to fetch DMs');
      }
      const data = await response.json();
      setDms(data);
    } catch (err) {
      console.error('Error fetching DMs:', err);
    }
  };

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
          {/* DM List */}
          {dms.length > 0 && (
            <div className="mt-3">
              <div className="text-[13.5px] font-normal text-neutral-400 mb-[6px] px-2 tracking-wide">
                Direct Messages
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {dms.map((dm) => (
                  <div
                    key={dm.id}
                    className={`flex items-center gap-3 px-2 pt-[4px] pb-[5px] rounded-md cursor-pointer transition-colors ${
                      selectedDM?.id === dm.id 
                        ? 'hover:bg-[#1d1d1e]  bg-[#2c2c30] text-white' 
                        : 'hover:bg-[#1d1d1e] text-[var(--header-text)]'
                    }`}
                    onClick={() => onDMSelect?.(dm)}
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <Image
                        src={dm.persona.imageUrl || '/avatars/default.png'}
                        alt={dm.persona.username}
                        className="w-8 h-8 rounded-full object-cover"
                        width={32}
                        height={32}
                        onError={(e) => {
                          e.currentTarget.src = '/avatars/default.png';
                        }}
                      />
                      <StatusIndicator status={StatusType.OFFLINE} size={14} />
                    </div>
                    
                    {/* Username */}
                    <div className="flex-1 min-w-0">
                      <div className="text-[16px] font-medium truncate">
                        {dm.persona.username.length > 28 
                          ? `${dm.persona.username.substring(0, 29)}...` 
                          : dm.persona.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
