'use client';

import { useState } from 'react';
import { MessageWithPersona } from '@/types/dm';
import { ChatMessageText } from './ChatMessageText';
import { MessageActionsMenu } from './MessageActionsMenu';
import { formatMessageTimeOnly } from '@/lib/utils';

interface PartialChatMessageProps {
  msg: MessageWithPersona;
  onDelete?: (messageId: string) => Promise<void>;
}

export function PartialChatMessage({ msg, onDelete }: PartialChatMessageProps) {
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
      <div className="flex gap-3 px-2 pt-0 pb-1 -mx-2 rounded-md hover:bg-[#2a2a2e] transition-colors">
        {/* Spacer to align with avatar from ChatMessage */}
        <div className="w-10" />
        
        <div className="flex-1 relative">
          {/* Show timestamp on hover - absolutely positioned */}
          <span className="font-gg-sans absolute left-[-50px] top-1/2 -translate-y-1/2 text-[#b9bbbe] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
            {formatMessageTimeOnly(new Date(msg.createdAt))}
          </span>
          <div className="pl-[4px]">
          <ChatMessageText content={msg.content} />
            </div>
          
        </div>
      </div>
    </div>
  );
}
