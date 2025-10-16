'use client';

interface ChatMessageTextProps {
  content: string;
}

export function ChatMessageText({ content }: ChatMessageTextProps) {
  return (
    <p className="text-[#dcddde] text-[16px] font-gg-sans pr-8 wrap-anywhere leading-[22px] m-0">{content}</p>
  );
}
