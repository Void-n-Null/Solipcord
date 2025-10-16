'use client';

import Image from 'next/image';
import { Persona } from '@/types/dm';

interface ChatProfileBlockProps {
  persona: Persona;
  onRemoveFriend: () => void;
  onBlock: () => void;
}

export function ChatProfileBlock({ persona, onRemoveFriend, onBlock }: ChatProfileBlockProps) {
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
