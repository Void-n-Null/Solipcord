'use client';

import Image from 'next/image';
import { Group, ChatEntity, DirectMessage } from '@/types/dm';
import { usePersonas } from '@/hooks/usePersonas';

interface ChatProfileBlockProps {
  data: ChatEntity;
  onRemoveFriend?: () => void;
  onBlock?: () => void;
}

export function ChatProfileBlock({ data, onRemoveFriend, onBlock }: ChatProfileBlockProps) {
  const isGroup = 'participantIds' in data;
  const participantIds = isGroup ? (data as Group).participantIds.slice(0, 4) : [];
  const { data: participantPersonas = [] } = usePersonas(participantIds);
  
  if (isGroup) {
    const group = data as Group;
    const displayCount = Math.min(4, group.participantIds.length);
    
    return (
      <div className="flex items-start gap-4 pt-4">
        {/* Group Avatars Grid */}
        <div className="relative">
          {displayCount <= 1 ? (
            // Single avatar for 1 person
            <div className="w-20 h-20 rounded-full bg-[#404040] flex items-center justify-center text-lg font-semibold">
              👥
            </div>
          ) : displayCount === 2 ? (
            // 2x1 grid for 2 people
            <div className="flex gap-2">
              {participantPersonas.slice(0, 2).map((persona) => (
                <Image
                  key={persona.id}
                  src={persona.imageUrl || '/avatars/default.png'}
                  alt={persona.username}
                  className="w-10 h-10 rounded-full object-cover"
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.src = '/avatars/default.png';
                  }}
                />
              ))}
            </div>
          ) : displayCount === 3 ? (
            // 2x2 with 1 in second row for 3 people
            <div className="grid grid-cols-2 gap-2">
              {participantPersonas.slice(0, 3).map((persona) => (
                <Image
                  key={persona.id}
                  src={persona.imageUrl || '/avatars/default.png'}
                  alt={persona.username}
                  className="w-10 h-10 rounded-full object-cover"
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.src = '/avatars/default.png';
                  }}
                />
              ))}
            </div>
          ) : (
            // 2x2 grid for 4 people
            <div className="grid grid-cols-2 gap-2">
              {participantPersonas.slice(0, 4).map((persona) => (
                <Image
                  key={persona.id}
                  src={persona.imageUrl || '/avatars/default.png'}
                  alt={persona.username}
                  className="w-10 h-10 rounded-full object-cover"
                  width={40}
                  height={40}
                  onError={(e) => {
                    e.currentTarget.src = '/avatars/default.png';
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* Group Name */}
          <h2 className="text-[31px] font-bold text-white mb-1">{group.name}</h2>

          {/* Group Description */}
          <p className="text-neutral-200 text-md mb-3">
            Welcome to the beginning of the <b>{group.name}</b> group.
          </p>

          {/* Member Count and Actions */}
          <div className="flex items-center gap-2">
            <span className="text-[#b9bbbe] text-sm">{group.participantIds.length} Members</span>
            {/* Action Buttons */}
            <div className="flex gap-2 ml-4">
              <button
                className="px-3 py-1 bg-[#5865F2] text-white text-xs font-medium rounded hover:bg-[#4752C4] transition-colors flex items-center gap-1"
              >
                👥 Invite Friends
              </button>
              <button
                className="px-3 py-1 bg-[#40444b] text-white text-xs font-medium rounded hover:bg-[#4f545c] transition-colors"
              >
                ✏️ Edit Group
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DM Profile Block (original behavior)
  const directMsg = data as DirectMessage;
  const persona = directMsg.persona;
  return (
    <div className="flex items-start gap-4 pt-4">
      {/* Profile Picture */}
      <div className="relative">
        <Image
          src={persona.imageUrl || '/avatars/default.png'}
          alt={persona.username}
          className="w-20 h-20 rounded-full object-cover"
          width={128}
          height={128}
          onError={(e) => {
            e.currentTarget.src = '/avatars/default.png';
          }}
        />

        {/* Display Name */}
        <h2 className="text-[31px] font-bold text-white mb-1 mt-2">{persona.username}</h2>
        
        {/* Username */}
        <p className="text-white text-2xl mb-3">{persona.username}</p>

        {/* DM History Message */}
        <p className="text-neutral-200 text-md mb-3">
          This is the beginning of your direct message history with <b>{persona.username}</b>.
        </p>

        {/* Mutual Friends and Actions */}
        <div className="flex items-center gap-2">
          <span className="text-[#b9bbbe] text-sm">0 Mutual Friends</span>
          {/* Action Buttons */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={onRemoveFriend}
              className="px-3 py-1 bg-[#40444b] text-white text-xs font-medium rounded hover:bg-[#4f545c] transition-colors"
            >
              Remove Friend
            </button>
            <button
              onClick={onBlock}
              className="px-3 py-1 bg-[#40444b] text-white text-xs font-medium rounded hover:bg-[#4f545c] transition-colors"
            >
              Block
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
