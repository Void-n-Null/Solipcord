import { User } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="">
        <div className="flex justify-center mx-auto px-5 pt-[6px] pb-[5px] ">
          <h1 className="text-[14px] text-center font-medium text-[var(--header-text)] inline-flex items-center justify-center gap-1">
            <User className="h-5 w-5" aria-hidden="true" />
            Friends
          </h1>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="w-18 "></aside>
        <div className="flex-1 ">
          <div className="h-full border-l border-t border-[var(--header-border)] bg-[rgba(255,255,255,0.01)] rounded-tl-xl"></div>
        </div>
      </div>
    </div>
  );
}
