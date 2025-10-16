'use client';

import { Plus, Gift, Smile, Gamepad2 } from 'lucide-react';

interface ChatTypingAreaProps {
  message: string;
  onMessageChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  personaUsername: string;
}

export function ChatTypingArea({
  message,
  onMessageChange,
  onSendMessage,
  personaUsername,
}: ChatTypingAreaProps) {
  return (
    <div className="px-[15px] py-2 mb-2 bg-[#222327] rounded-md mx-2 border border-[#404040]/20">
      <form onSubmit={onSendMessage} className="flex items-center gap-3">
        {/* Plus Button */}
        <button
          type="button"
          className="p-2 pl-0 text-[#b9bbbe] hover:text-white transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
        
        {/* Message Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder={`Message @${personaUsername}`}
            className="w-full pl-[4px] text-[16px] placeholder:text-[16px] text-white placeholder-[#72767d] py-2 rounded-lg border-0 focus:outline-none focus:ring-0"
          />
        </div>
        
        {/* Action Icons
        <div className="flex items-center gap-1">
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
            <span className="text-xs font-semibold">Sticker</span>
          </button>
          <button
            type="button"
            className="p-2 text-[#b9bbbe] hover:text-white transition-colors"
          >
            <Gamepad2 className="w-5 h-5" />
          </button>
        </div> */}
      </form>
    </div>
  );
}
