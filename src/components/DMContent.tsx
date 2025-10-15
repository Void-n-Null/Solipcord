import { ReactNode } from 'react';

interface DMContentProps {
  children?: ReactNode;
}

export function DMContent({ children }: DMContentProps) {
  return (
    <div className="flex-1 flex flex-col">
      {children || (
        <>
          <div className="w-full h-[48px] border-b border-[var(--header-border)] flex items-center px-4">
            <div className="flex-1">
              <div className="text-white/60">Default Content</div>
            </div>
          </div>
          <div className="flex-1 bg-[#1a1a1e] p-4">
            <div className="h-full">
              <div className="text-white/60 text-center mt-8">
                Main content area - ready for your content
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
