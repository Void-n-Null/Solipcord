'use client';

interface MessageDateDividerProps {
  date: Date;
  size?: 'sm' | 'md';
}

export function MessageDateDivider({ date, size = 'md' }: MessageDateDividerProps) {


  return (
    <div className="flex items-center justify-center py-3">
      <div className="flex items-center w-full pr-5">
        <div className="flex-1 h-px bg-[#404040]/50"></div>
        <div className={`px-1 text-[#b9bbbe]/80 font-gg-sans text-xs font-semibold`}>
          {date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <div className="flex-1 h-px bg-[#404040]/50"></div>
      </div>
    </div>
  );
}
