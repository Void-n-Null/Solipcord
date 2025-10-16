'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MessageWithPersona } from '@/types/dm';
import { ChatMessageText } from './ChatMessageText';
import { MessageActionsMenu } from './MessageActionsMenu';
import { formatMessageTime } from '@/lib/utils';

interface ChatMessageProps {
  msg: MessageWithPersona;
  onDelete?: (messageId: string) => Promise<void>;
}

export function ChatMessage({ msg, onDelete }: ChatMessageProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Actions Menu */}
      <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
        <MessageActionsMenu 
          messageId={msg.id}
          onDelete={onDelete}
          isVisible={showMenu}
        />
      </div>

      {/* Message Content */}
      <div className="flex gap-4 px-2 pt-2 pb-1 -mx-2 rounded-md hover:bg-[#2a2a2e] transition-colors items-start">
        <Image
          src={msg.persona?.imageUrl || '/avatars/default.png'}
          alt={msg.persona?.username || 'User'}
          className="w-10 h-10 rounded-full object-cover mt-[-2px] flex-shrink-0"
          width={40}
          height={40}
          onError={(e) => {
            e.currentTarget.src = '/avatars/default.png';
          }}
        />
        
        <div className="flex-1 min-w-0">
          <div className="relative top-[-4px] flex items-baseline gap-2 mt-[-3px]">
            <span className="text-white font-medium text-[16px]">
              {msg.persona?.username || 'You'}
            </span>
            <span className="text-[#b9bbbe] text-xs">
              {formatMessageTime(new Date(msg.createdAt))}
            </span>
          </div>
          <div className="mt-[-5px]">
          <ChatMessageText content={msg.content} />
          </div>
          
        </div>
      </div>
    </div>
  );
}
