'use client';

import { useState } from 'react';

interface MessageActionsMenuProps {
  messageId: string;
  onDelete?: (messageId: string) => Promise<void>;
  isVisible?: boolean;
}

export function MessageActionsMenu({ messageId, onDelete, isVisible = true }: MessageActionsMenuProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(messageId);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="flex items-center gap-1 bg-[#2c2f33] rounded-lg px-2 py-1.5 shadow-lg border border-[#404040]">
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1.5 text-[#72767d] hover:text-[#f04747] hover:bg-[#2a2a2e] rounded transition-colors disabled:opacity-50"
        title="Delete message"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
          <path d="M6.5 1.5H5.5A.5.5 0 0 0 5 2v1H2.5a.5.5 0 0 0 0 1h.31l1.126 11.26A1.5 1.5 0 0 0 5.407 15h5.186a1.5 1.5 0 0 0 1.491-1.44L14.19 4h.31a.5.5 0 0 0 0-1H11V2a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1H6.5a.5.5 0 0 0-.5.5V2a.5.5 0 0 0 .5.5zm2.5 0v1h-2V1.5h2z" />
        </svg>
      </button>
    </div>
  );
}
